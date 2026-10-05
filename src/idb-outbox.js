import { ignoreFailure } from './best-effort.js';
const DB_NAME = '247420-outbox';
const STORE = 'pending';

function isBrowser() { return typeof indexedDB !== 'undefined'; }

function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function queueMessage(topic, body) {
    if (!isBrowser()) return null;
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const req = tx.objectStore(STORE).add({ topic, body, queuedAt: Date.now() });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function listQueued(topic = null) {
    if (!isBrowser()) return [];
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = () => resolve(topic ? req.result.filter((r) => r.topic === topic) : req.result);
        req.onerror = () => reject(req.error);
    });
}

async function removeQueued(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const req = tx.objectStore(STORE).delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function flushQueue(topic, sender) {
    const items = await listQueued(topic);
    let flushed = 0;
    for (const item of items) {
        try {
            await sender(item.body);
            await removeQueued(item.id);
            flushed++;
        } catch {
            break;
        }
    }
    return flushed;
}

export function watchReconnect(topic, sender) {
    if (typeof window === 'undefined') return () => {};
    const handler = () => { flushQueue(topic, sender).catch(ignoreFailure); };
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
}

export function isOnline() {
    return typeof navigator === 'undefined' || navigator.onLine !== false;
}
