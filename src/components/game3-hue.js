const HUES = [264, 145, 25, 330, 200, 85];

export const game3Hue = (s) => {
    let h = 0;
    for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return HUES[h % HUES.length];
};

const IMAGE_RE = /^(https:\/\/[^\s"'<>()\\]{3,1900}|data:image\/(png|jpeg|webp|gif|svg\+xml);(base64|utf8),[^\s"'<>\\]{8,60000})$/i;
const COLOUR_RE = /^#[0-9a-f]{6}$/i;

let avatars = {};
let accents = {};

export const game3SetAvatars = (map, accentMap) => { avatars = map || {}; accents = accentMap || {}; };

export const game3SafeImage = (u) => (typeof u === 'string' && IMAGE_RE.test(u.trim()) ? u.trim() : '');

export const game3CssUrl = (u) => 'url("' + String(u).replace(/["\\\n\r()]/g, (c) => '%' + c.charCodeAt(0).toString(16)) + '")';

export const game3AvatarUrl = (id) => (id ? game3SafeImage(avatars[id]) : '');

export const game3AvatarBg = (name, id) => {
    const accent = id && COLOUR_RE.test(accents[id] || '') ? accents[id] : '';
    const base = accent || 'oklch(.62 .16 ' + game3Hue(name) + ')';
    const url = game3AvatarUrl(id);
    return url ? game3CssUrl(url) + ' center/cover no-repeat, ' + base : base;
};

export const game3AvInitial = (text, id) => (game3AvatarUrl(id) ? '' : text);

export const game3AvatarFont = (size) => Math.round(size * 0.42) + 'px';
