#!/usr/bin/env node
import fs from 'node:fs';

export const CDP_BASE = process.env.CDP_BASE || 'http://127.0.0.1:9333';

const CALL_TIMEOUT_MS = 30000;
const LOAD_TIMEOUT_MS = 20000;
const PROBE_TIMEOUT_MS = 3000;
const READY_POLL_MS = 100;
const THEME_SETTLE_MS = 200;
const CLOSED_OR_CLOSING = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function cdpAvailable(base = CDP_BASE) {
    try {
        const r = await fetch(`${base}/json/version`, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
        return r.ok;
    } catch {
        return false;
    }
}

async function newTarget(base) {
    const r = await fetch(`${base}/json/new?about:blank`, { method: 'PUT' });
    if (!r.ok) throw new Error(`CDP /json/new failed: ${r.status} ${r.statusText}`);
    return r.json();
}

async function closeTarget(base, id) {
    await fetch(`${base}/json/close/${id}`).catch(() => { });
}

function describeException(exceptionDetails) {
    return exceptionDetails.exception?.description || exceptionDetails.text;
}

function emulatedMediaFeatures({ colorScheme, reducedMotion }) {
    const features = [];
    if (colorScheme) features.push({ name: 'prefers-color-scheme', value: colorScheme });
    if (reducedMotion) features.push({ name: 'prefers-reduced-motion', value: reducedMotion });
    return features;
}

export async function withPage(url, fn, opts = {}) {
    const { width = 1280, height = 900, dsf = 1, base = CDP_BASE, settleMs = 500, emulate } = opts;
    const target = await newTarget(base);
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let nextId = 0;
    const pending = new Map();
    const events = [];

    await new Promise((res, rej) => {
        ws.addEventListener('open', res, { once: true });
        ws.addEventListener('error', () => rej(new Error('CDP websocket error')), { once: true });
    });

    ws.addEventListener('message', (ev) => {
        const raw = typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString();
        const m = JSON.parse(raw);
        if (m.id && pending.has(m.id)) {
            const { res, rej } = pending.get(m.id);
            pending.delete(m.id);
            if (m.error) rej(new Error(JSON.stringify(m.error)));
            else res(m.result);
        } else if (m.method) {
            events.push(m);
        }
    });

    const send = (method, params = {}) => new Promise((res, rej) => {
        const id = ++nextId;
        pending.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
        setTimeout(() => {
            if (pending.has(id)) {
                pending.delete(id);
                rej(new Error(`CDP timeout: ${method}`));
            }
        }, CALL_TIMEOUT_MS);
    });

    const api = {
        send,
        async evaluate(expression) {
            const { result, exceptionDetails } = await send('Runtime.evaluate', {
                expression, returnByValue: true, awaitPromise: true,
            });
            if (exceptionDetails) throw new Error(`page evaluate threw: ${describeException(exceptionDetails)}`);
            return result.value;
        },
        async addScriptFile(filePath) {
            const src = fs.readFileSync(filePath, 'utf8');
            const { exceptionDetails } = await send('Runtime.evaluate', {
                expression: src, returnByValue: false, awaitPromise: false,
            });
            if (exceptionDetails) throw new Error(`script injection threw: ${describeException(exceptionDetails)}`);
        },
        async screenshot({ full = false } = {}) {
            const { data } = await send('Page.captureScreenshot', {
                format: 'png', captureBeyondViewport: !!full,
            });
            return Buffer.from(data, 'base64');
        },
        async setColorScheme(scheme) {
            await send('Emulation.setEmulatedMedia', {
                features: [{ name: 'prefers-color-scheme', value: scheme }],
            });
        },
        async setEmulatedPrefs(prefs = {}) {
            const features = emulatedMediaFeatures(prefs);
            if (features.length) await send('Emulation.setEmulatedMedia', { features });
        },
        async setTheme(theme) {
            await api.evaluate(`document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)})`);
            await sleep(THEME_SETTLE_MS);
        },
        pageErrors: () => events
            .filter((e) => e.method === 'Runtime.exceptionThrown')
            .map((e) => e.params?.exceptionDetails?.text || ''),
    };

    async function waitForDocumentComplete() {
        const startedAt = Date.now();
        for (;;) {
            if (await api.evaluate('document.readyState') === 'complete') return;
            if (Date.now() - startedAt > LOAD_TIMEOUT_MS) throw new Error(`page load timeout: ${url}`);
            await sleep(READY_POLL_MS);
        }
    }

    try {
        await send('Page.enable');
        await send('Runtime.enable');
        await send('Network.enable');
        await send('Network.setCacheDisabled', { cacheDisabled: true });
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dsf, mobile: false });
        if (emulate) await api.setEmulatedPrefs(emulate);
        await send('Page.navigate', { url });
        await waitForDocumentComplete();
        await sleep(settleMs);

        return await fn(api);
    } finally {
        if (ws.readyState < CLOSED_OR_CLOSING) ws.close();
        await closeTarget(base, target.id);
    }
}
