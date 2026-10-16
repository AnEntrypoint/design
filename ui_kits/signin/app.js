import * as webjsx from 'webjsx';
import { Topbar, Crumb, Status, AppShell, Heading, Lede, Icon } from 'ds/components/shell.js';
import { InputOTP } from 'ds/components/content.js';
import { Divider } from 'ds/components/editor-primitives.js';
import { mountKit } from 'ds/bootstrap.js';
import { shortUid } from 'ds/uid.js';
const h = webjsx.createElement;

const root = document.getElementById('root');
const state = { mode: 'signin', email: '', password: '', remember: false, sent: false, error: '', loading: null, demoUrl: '', otp: '', otpVerified: false, otpError: '', emailError: '', passwordError: '', showPassword: false };

function setMode(m) { state.mode = m; state.sent = false; state.error = ''; state.emailError = ''; state.passwordError = ''; state.loading = null; state.demoUrl = ''; state.otp = ''; state.otpVerified = false; state.otpError = ''; state.showPassword = false; kit.render(); }

function validateEmail() {
    if (!state.email.trim()) { state.emailError = ''; return; }
    state.emailError = state.email.includes('@') ? '' : 'enter a valid email address (missing @).';
}
function validatePassword() {
    if (state.mode === 'magic' || state.mode === 'reset') { state.passwordError = ''; return; }
    if (!state.password) { state.passwordError = ''; return; }
    state.passwordError = state.password.length < 6 ? 'password must be at least 6 characters.' : '';
}

const DEMO_CODE = '247420';

function verifyOtp(code) {
    state.otp = code;
    if (code.length < 6) { state.otpError = ''; kit.render(); return; }
    if (code === DEMO_CODE) {
        state.otpVerified = true;
        state.otpError = '';
    } else {
        state.otpError = 'incorrect code. demo code: ' + DEMO_CODE + '.';
    }
    kit.render();
}

function submit(e) {
    e.preventDefault();
    if (!state.email.trim()) { state.error = 'enter the email address for your account.'; kit.render(); return; }
    validateEmail();
    if (state.emailError) { state.error = state.emailError; kit.render(); return; }
    if (state.mode !== 'magic' && state.mode !== 'reset') {
        validatePassword();
        if (state.passwordError) { state.error = state.passwordError; kit.render(); return; }
    }
    state.error = '';
    state.sent = true;
    kit.render();
}

function Provider({ icon, label, provider }) {
    const isLoading = state.loading === provider;
    return h('button', {
        class: 'btn ds-auth-provider-btn' + (isLoading ? ' ds-auth-provider-btn--loading' : ''),
        onclick: (e) => {
            e.preventDefault();
            if (isLoading) return;
            state.loading = provider;
            state.error = '';
            kit.render();
            startOAuthFlow(provider);
        },
        disabled: isLoading
    },
        h('span', { class: 'ds-auth-provider-glyph' + (isLoading ? ' ds-spin' : '') }, Icon(isLoading ? 'refresh' : icon)),
        h('span', {}, isLoading ? 'redirecting...' : label)
    );
}

const AUTH_ENV = (typeof globalThis !== 'undefined' && globalThis.__DS_AUTH) || {};

function startOAuthFlow(provider) {
    const config = {
        github: {
            clientId: AUTH_ENV.githubClientId || 'demo-github-client-id',
            redirectUri: window.location.origin + '/auth/callback/github'
        },
        google: {
            clientId: AUTH_ENV.googleClientId || 'demo-google-client-id',
            redirectUri: window.location.origin + '/auth/callback/google'
        },
        sso: {
            endpoint: AUTH_ENV.ssoEndpoint || 'https://sso.247420.xyz/authorize',
            redirectUri: window.location.origin + '/auth/callback/sso'
        }
    }[provider];

    if (!config) {
        state.error = 'provider not configured';
        state.loading = null;
        kit.render();
        return;
    }

    try {
        if (provider === 'github') {
            const scopes = ['user:email', 'read:user'].join(' ');
            const params = new URLSearchParams({
                client_id: config.clientId,
                redirect_uri: config.redirectUri,
                scope: scopes,
                state: generateState()
            });
            go('https://github.com/login/oauth/authorize?' + params);
        } else if (provider === 'google') {
            const scopes = ['openid', 'email', 'profile'].join(' ');
            const params = new URLSearchParams({
                client_id: config.clientId,
                redirect_uri: config.redirectUri,
                response_type: 'code',
                scope: scopes,
                state: generateState()
            });
            go('https://accounts.google.com/o/oauth2/v2/auth?' + params);
        } else if (provider === 'sso') {
            const params = new URLSearchParams({
                redirect_uri: config.redirectUri,
                state: generateState()
            });
            go(config.endpoint + '?' + params);
        }
    } catch (err) {
        state.error = 'oauth flow failed: ' + (err.message || 'unknown error');
        state.loading = null;
        kit.render();
    }
}

function isDemoConfig() {
    return !AUTH_ENV.githubClientId && !AUTH_ENV.googleClientId && !AUTH_ENV.ssoEndpoint;
}

function go(url) {
    if (isDemoConfig()) {
        state.loading = null;
        state.demoUrl = url;
        kit.render();
        return;
    }
    window.location.href = url;
}

function generateState() {
    return btoa(JSON.stringify({
        nonce: shortUid(11),
        timestamp: Date.now()
    }));
}

function Form() {
    if (state.sent) {
        const waiting = state.mode === 'magic' || state.mode === 'reset';
        const magicVerify = state.mode === 'magic' && !state.otpVerified;
        return h('div', { class: 'ds-auth-form ds-auth-sent' },
            h('div', { class: 'ds-auth-sent-glyph' }, state.otpVerified ? '[ok]' : '[x]'),
            h('p', { class: 'ds-auth-sent-title' },
                state.otpVerified ? 'verified' :
                state.mode === 'magic' ? 'check your email' : (state.mode === 'reset' ? 'reset link sent' : (state.mode === 'signup' ? 'account created' : 'welcome back'))),
            h('p', { class: 'ds-auth-sent-sub' },
                state.otpVerified ? '(demo) signed in. nothing further happens in this specimen.' :
                state.mode === 'magic'
                ? 'we sent a sign-in link to ' + state.email + '. it expires in 15 minutes. you can also enter the ' + DEMO_CODE.length + '-digit code from the email below (demo code: ' + DEMO_CODE + ').'
                : (state.mode === 'reset' ? 'we sent a reset link to ' + state.email + '. follow it to set a new password.' : '(demo) signed in. nothing further happens in this specimen.')),
            magicVerify ? h('div', { class: 'ds-auth-otp-wrap' },
                InputOTP({
                    length: DEMO_CODE.length, value: state.otp,
                    onChange: (code) => verifyOtp(code),
                    onComplete: (code) => verifyOtp(code),
                    error: Boolean(state.otpError),
                    label: 'sign-in code',
                }),
                state.otpError ? h('div', { class: 'ds-auth-error', role: 'alert' }, state.otpError) : null
            ) : null,
            waiting && !state.otpVerified ? h('button', {
                class: 'btn',
                onclick: (e) => { e.preventDefault(); state.sent = false; state.otp = ''; state.otpVerified = false; state.otpError = ''; kit.render(); }
            }, 'use a different email') : null
        );
    }
    return h('form', { onsubmit: submit, class: 'ds-auth-form' },
        h('label', { class: 'ds-auth-field' },
            h('span', { class: 'ds-auth-field-label' }, 'email'),
            h('input', {
                class: 'input', type: 'email', placeholder: 'you@247420.xyz', value: state.email,
                autocomplete: 'email', required: true, 'aria-required': 'true',
                'aria-invalid': state.emailError ? 'true' : 'false',
                oninput: (e) => { state.email = e.target.value; if (state.emailError) validateEmail(); kit.render(); },
                onblur: () => { validateEmail(); kit.render(); }
            }),
            state.emailError ? h('div', { class: 'ds-auth-error', role: 'alert' }, state.emailError) : null
        ),
        state.mode !== 'magic' && state.mode !== 'reset' ? h('label', { class: 'ds-auth-field' },
            h('span', { class: 'ds-auth-field-label' }, 'password'),
            h('div', { class: 'ds-auth-field-input-row' },
                h('input', {
                    class: 'input', type: state.showPassword ? 'text' : 'password', placeholder: '********',
                    value: state.password, autocomplete: state.mode === 'signup' ? 'new-password' : 'current-password',
                    required: true, 'aria-required': 'true',
                    'aria-invalid': state.passwordError ? 'true' : 'false',
                    oninput: (e) => { state.password = e.target.value; validatePassword(); kit.render(); }
                }),
                h('button', {
                    type: 'button', class: 'ds-icon-btn ds-icon-btn-sm ds-icon-btn-ghost ds-auth-pw-toggle',
                    'aria-pressed': state.showPassword ? 'true' : 'false',
                    'aria-label': state.showPassword ? 'hide password' : 'show password',
                    onclick: (e) => { e.preventDefault(); state.showPassword = !state.showPassword; kit.render(); }
                }, Icon(state.showPassword ? 'eye-off' : 'eye'))
            ),
            state.passwordError ? h('div', { class: 'ds-auth-error', role: 'alert' }, state.passwordError) : null
        ) : null,
        state.mode === 'signin' ? h('div', { class: 'ds-auth-row-between' },
            h('label', { class: 'ds-auth-remember' },
                h('input', { type: 'checkbox', checked: state.remember, onchange: (e) => { state.remember = e.target.checked; } }),
                h('span', { class: 'ds-auth-remember-text' }, 'remember me')
            ),
            h('a', { href: '#reset', onclick: (e) => { e.preventDefault(); setMode('reset'); }, class: 'ds-auth-forgot' }, 'forgot password?')
        ) : null,
        state.error && state.error !== state.emailError && state.error !== state.passwordError
            ? h('div', { class: 'ds-auth-error', role: 'alert' }, state.error) : null,
        state.demoUrl ? h('div', { class: 'ds-auth-status', role: 'status' },
            'demo mode: would open ' + state.demoUrl) : null,
        h('button', { class: 'btn btn-primary', type: 'submit' },
            state.mode === 'signup' ? 'create account' :
            state.mode === 'magic'  ? 'send magic link' :
            state.mode === 'reset'  ? 'send reset link' : 'sign in'
        ),
        state.mode !== 'reset' ? Divider({ label: 'or' }) : null,
        state.mode !== 'reset' ? h('div', { class: 'ds-auth-providers' },
            Provider({ icon: 'github', label: 'github', provider: 'github' }),
            Provider({ icon: 'google', label: 'google', provider: 'google' }),
            Provider({ icon: 'sso', label: 'sso', provider: 'sso' })
        ) : null
    );
}

function App() {
    const headings = {
        signin: ['sign in',     'pick a provider or use email.'],
        signup: ['create',      'join the 247420 portfolio. one account works across every kit.'],
        magic:  ['magic link',  "we will email you a one-tap sign-in link. it replaces the password."],
        reset:  ['reset',       'enter your email to receive a reset link.']
    }[state.mode];
    return AppShell({
        narrow: true,
        topbar: Topbar({ brand: '247420', leaf: 'auth', items: [['index', '../../']] }),
        crumb: Crumb({ trail: ['247420', 'kits'], leaf: state.mode === 'signin' ? 'signin' : 'signin · ' + state.mode }),
        main: [
            h('div', { class: 'ds-app-surface ds-auth-wrap' },
                h('div', { class: 'ds-auth-col' },
                    Heading({ level: 1, children: headings[0] }),
                    Lede({ children: headings[1] }),
                    Form(),
                    h('div', { class: 'ds-auth-modes' },
                        ['signin', 'signup', 'magic'].map((m) =>
                            h('a', { key: m, href: '#' + m,
                                onclick: (e) => { e.preventDefault(); setMode(m); },
                                class: 'ds-auth-mode-link' + ((state.mode === m || (state.mode === 'reset' && m === 'signin')) ? ' ds-auth-mode-link--active' : '')
                            }, m === 'signin' ? (state.mode === 'reset' ? '<- back to sign in' : 'sign in') : m === 'signup' ? 'create account' : 'magic link')
                        )
                    ),
                    h('p', { class: 'ds-auth-fineprint' }, 'by continuing you agree to the terms and the privacy notice.')

                )
            )
        ],
        status: Status({
            left: ['auth', state.mode, state.error ? 'error' : 'ok'],
            right: ['no real auth']
        })
    });
}

const kit = mountKit({ root, view: App, screen: '11 Sign in' });
