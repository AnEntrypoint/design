const SEED_IN_TEXT = /(?:sharesies\/?#|--key[= ]\s*|--connect[= ]\s*)([0-9a-fA-F]{16,})/;

export const seedFromContent = (content) => {
    const m = SEED_IN_TEXT.exec(String(content || ''));
    return m ? m[1] : null;
};

export const sessionIdFor = (seed) => {
    let hash = 2166136261;
    for (const ch of String(seed)) { hash ^= ch.charCodeAt(0); hash = Math.imul(hash, 16777619) >>> 0; }
    return 'sh' + hash.toString(16).padStart(8, '0');
};
