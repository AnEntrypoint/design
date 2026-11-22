const HUES = [264, 145, 25, 330, 200, 85];

export const game3Hue = (s) => {
    let h = 0;
    for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return HUES[h % HUES.length];
};

export const game3AvatarBg = (name) => 'oklch(.62 .16 ' + game3Hue(name) + ')';

export const game3AvatarFont = (size) => Math.round(size * 0.42) + 'px';
