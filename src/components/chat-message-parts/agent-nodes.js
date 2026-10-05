import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
import { t } from '../../i18n.js';
import { GitDiffView } from '../git-status.js';
import { copyToClipboardWithFeedback } from './inline.js';

const h = webjsx.createElement;

const LONG_BODY_THRESHOLD = 2000;

function looksLikeUnifiedDiff(text) {
    if (!text || text.indexOf('@@') === -1) return false;
    return /^@@ .* @@/m.test(text) && /^[+-]/m.test(text);
}

function foldableBody(part, cacheKey, text, preProps, defaultOpen) {
    const preNode = h('pre', preProps, h('code', {}, text));
    if (text.length < LONG_BODY_THRESHOLD) return preNode;
    const openFlag = cacheKey + 'Open';
    if (part[openFlag] === undefined) part[openFlag] = !!defaultOpen;
    const isOpen = part[openFlag];
    const lines = text.split('\n').length;
    return h('details', {
        class: 'chat-tool-longbody',
        open: isOpen,
        ontoggle: (e) => { part[openFlag] = e.currentTarget.open; },
    },
        h('summary', { class: 'chat-tool-longbody-summary' },
            `${lines.toLocaleString()} lines, ${text.length.toLocaleString()} chars -- click to expand`),
        preNode);
}

function filenameFromDiff(text) {
    const m = /^\+\+\+ b?\/?(.+)$/m.exec(text) || /^--- a?\/?(.+)$/m.exec(text);
    return m ? m[1].trim() : undefined;
}

export function ToolCallNode(p) {
    const status = p.status || (p.error ? 'error' : (p.result != null ? 'done' : 'running'));
    if (p._argsCache !== p.args) {
        p._argsTextCache = typeof p.args === 'string' ? p.args : JSON.stringify(p.args || {}, null, 2);
        p._argsCache = p.args;
    }
    const argsText = p._argsTextCache;
    if (p._resultCache !== p.result) {
        p._resultTextCache = p.result == null ? '' : (typeof p.result === 'string' ? p.result : JSON.stringify(p.result, null, 2));
        p._resultCache = p.result;
    }
    const resultText = p._resultTextCache;
    const hasArgs = p.args != null && argsText !== '{}' && argsText.trim() !== '';
    const defaultOpen = p.open != null ? !!p.open : (status === 'running' || status === 'error');
    const iconName = status === 'running' ? 'refresh' : (status === 'error' ? 'warn' : 'check');
    const copyText = (txt) => (e) => copyToClipboardWithFeedback(txt, e.currentTarget);
    const sectionLabel = (text, txt) => h('div', { class: 'chat-tool-section-label' },
        h('span', {}, text),
        h('button', { type: 'button', class: 'chat-code-copy chat-tool-copy', 'aria-label': 'copy ' + text, onclick: copyText(txt) }, 'copy'));
    return h('details', { class: 'chat-bubble chat-tool tool-' + status, open: defaultOpen },
        h('summary', { class: 'chat-tool-head' },
            h('span', { class: 'chat-tool-icon', 'aria-hidden': 'true' }, Icon(iconName, { size: 14 })),
            h('span', { class: 'chat-tool-name' }, p.name || 'tool'),
            p.label ? h('span', { class: 'chat-tool-label' }, p.label) : null,
            h('span', { class: 'chat-tool-status' }, status)
        ),
        h('div', { class: 'chat-tool-body' },
            ...[
                hasArgs ? h('div', { class: 'chat-tool-section' },
                    sectionLabel('args', argsText),
                    foldableBody(p, '_args', argsText, { class: 'chat-tool-pre' }, defaultOpen)) : null,
                resultText
                    ? (!p.error && looksLikeUnifiedDiff(resultText)
                        ? h('div', { class: 'chat-tool-section' },
                            sectionLabel('result', resultText),
                            GitDiffView({ diff: resultText, filename: filenameFromDiff(resultText) }))
                        : h('div', { class: 'chat-tool-section' },
                            sectionLabel(p.error ? 'error' : 'result', resultText),
                            foldableBody(p, '_result', resultText, { class: 'chat-tool-pre' + (p.error ? ' is-error' : '') }, defaultOpen)))
                    : (status === 'done' ? h('div', { class: 'chat-tool-section' },
                        h('div', { class: 'chat-tool-section-label' }, 'result'),
                        h('pre', { class: 'chat-tool-pre chat-tool-empty' }, h('code', {}, '(no output)'))) : null)
            ].filter(Boolean)
        )
    );
}

export function ApprovalNode(p) {
    const status = p.status || 'pending';
    const argsText = typeof p.args === 'string' ? p.args : JSON.stringify(p.args || {}, null, 2);
    const iconName = status === 'pending' ? 'warn' : (status === 'approved' ? 'check' : 'warn');
    const decide = (decision) => (e) => { e.preventDefault(); const fn = p.onResolve; if (fn) { p.onResolve = null; fn(decision); } };
    return h('div', { class: 'chat-bubble chat-tool chat-approval tool-' + (status === 'pending' ? 'running' : status) },
        h('div', { class: 'chat-tool-head' },
            h('span', { class: 'chat-tool-icon', 'aria-hidden': 'true' }, Icon(iconName, { size: 14 })),
            h('span', { class: 'chat-tool-name' }, 'approval: ' + (p.name || 'tool')),
            h('span', { class: 'chat-tool-status' }, status)
        ),
        h('div', { class: 'chat-tool-body' },
            h('div', { class: 'chat-tool-section' },
                h('div', { class: 'chat-tool-section-label' }, h('span', {}, 'args')),
                h('pre', { class: 'chat-tool-pre' }, h('code', {}, argsText))),
            status === 'pending'
                ? h('div', { class: 'chat-approval-actions' },
                    h('button', { type: 'button', class: 'chat-code-copy chat-approval-btn', onclick: decide({ approved: true }) }, 'approve'),
                    h('button', { type: 'button', class: 'chat-code-copy chat-approval-btn', onclick: decide({ approved: true, always: true }) }, 'always'),
                    h('button', { type: 'button', class: 'chat-code-copy chat-approval-btn', onclick: decide({ approved: false }) }, 'reject'))
                : h('div', { class: 'chat-approval-note' }, status === 'approved' ? (p.always ? 'approved (always, this turn)' : 'approved') : 'rejected')
        )
    );
}

export function QuestionNode(p) {
    const status = p.status || 'pending'
    const questions = Array.isArray(p.questions) ? p.questions : []
    if (!p._sel) p._sel = {}
    const submit = (e) => {
        e.preventDefault()
        const fn = p.onResolve
        if (!fn) return
        p.onResolve = null
        const answers = {}
        for (const q of questions) {
            const v = p._sel[q.question]
            answers[q.question] = Array.isArray(v) ? v.join(', ') : (v || '')
        }
        fn({ answers })
    }
    const skip = (e) => { e.preventDefault(); const fn = p.onResolve; if (fn) { p.onResolve = null; fn({ rejected: true }) } }
    const blocks = questions.map((q, qi) => {
        const qtext = q.question || ''
        const opts = Array.isArray(q.options) ? q.options : []
        const multi = !!q.multi_select
        const kids = []
        if (q.header) kids.push(h('div', { key: 'h' + qi, class: 'chat-question-header' }, q.header))
        kids.push(h('div', { key: 't' + qi, class: 'chat-question-text' }, qtext))
        if (opts.length) {
            kids.push(h('div', { key: 'o' + qi, class: 'chat-question-opts' },
                ...opts.map((o, oi) => h('button', {
                    key: 'ob' + qi + '-' + oi, type: 'button',
                    class: 'chat-code-copy chat-approval-btn',
                    onclick: (e) => {
                        e.preventDefault()
                        if (multi) {
                            const cur = new Set(p._sel[qtext] || [])
                            if (cur.has(o.label)) cur.delete(o.label); else cur.add(o.label)
                            p._sel[qtext] = [...cur]
                            e.currentTarget.classList.toggle('is-on')
                        } else {
                            p._sel[qtext] = o.label
                            e.currentTarget.parentNode.querySelectorAll('.chat-approval-btn').forEach((b) => b.classList.remove('is-on'))
                            e.currentTarget.classList.add('is-on')
                        }
                    },
                }, o.label))))
        }
        kids.push(h('input', {
            key: 'i' + qi, type: 'text', class: 'chat-question-other', placeholder: 'other…',
            onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); p._sel[qtext] = e.currentTarget.value; submit(e) } },
        }))
        return h('div', { key: 'q' + qi, class: 'chat-question-block' }, ...kids)
    })
    return h('div', { class: 'chat-bubble chat-tool chat-question tool-' + (status === 'pending' ? 'running' : 'done') },
        h('div', { class: 'chat-tool-head' },
            h('span', { class: 'chat-tool-icon', 'aria-hidden': 'true' }, Icon(status === 'pending' ? 'warn' : 'check', { size: 14 })),
            h('span', { class: 'chat-tool-name' }, 'question'),
            h('span', { class: 'chat-tool-status' }, status)),
        h('div', { class: 'chat-tool-body' },
            status === 'pending'
                ? [...blocks, h('div', { key: 'act', class: 'chat-approval-actions' },
                    h('button', { type: 'button', class: 'chat-code-copy chat-approval-btn', onclick: submit }, 'submit'),
                    h('button', { type: 'button', class: 'chat-code-copy chat-approval-btn', onclick: skip }, 'skip'))]
                : h('pre', { class: 'chat-tool-pre' }, h('code', {}, JSON.stringify(p.answers || {}, null, 2)))))
}

export function ThinkingNode(p) {
    if (p.settled) {
        return h('details', { class: 'chat-bubble chat-thinking-settled' },
            h('summary', {}, t('chat.viewThinking', 'View thinking')),
            h('div', { class: 'chat-thinking-body' }, p.text)
        );
    }
    return h('div', { class: 'chat-bubble chat-thinking', role: 'status', 'aria-live': 'polite' },
        h('span', { class: 'chat-thinking-dots', 'aria-hidden': 'true' }, h('span'), h('span'), h('span')),
        h('span', { class: 'chat-thinking-text' }, p.text || t('chat.thinking', 'thinking…'))
    );
}
