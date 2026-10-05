export function attempt(fn, fallback) {
    try { return fn(); } catch { return fallback; }
}

export async function attemptAsync(fn, fallback) {
    try { return await fn(); } catch { return fallback; }
}

export function ignoreFailure() {}
