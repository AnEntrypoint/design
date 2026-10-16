
function srgbToLinear(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c) {
    c = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, c)) * 255);
}
function rgbToXyz(r, g, b) {
    r = srgbToLinear(r); g = srgbToLinear(g); b = srgbToLinear(b);
    return [
        r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
        r * 0.2126729 + g * 0.7151522 + b * 0.0721750,
        r * 0.0193339 + g * 0.1191920 + b * 0.9503041,
    ];
}
function xyzToRgb(x, y, z) {
    const r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    const g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
    const b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
    return [linearToSrgb(r), linearToSrgb(g), linearToSrgb(b)];
}
const WHITE = [0.95047, 1.0, 1.08883];
function fInv(t) { return t > 6 / 29 ? t * t * t : 3 * (6 / 29) ** 2 * (t - 4 / 29); }
function f(t) { return t > (6 / 29) ** 3 ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29; }

function xyzToLab(x, y, z) {
    const fx = f(x / WHITE[0]), fy = f(y / WHITE[1]), fz = f(z / WHITE[2]);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function labToXyz(L, a, b) {
    const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
    return [fInv(fx) * WHITE[0], fInv(fy) * WHITE[1], fInv(fz) * WHITE[2]];
}

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

function hueChromaFromHex(hex) {
    const [r, g, b] = hexToRgb(hex);
    const [x, y, z] = rgbToXyz(r, g, b);
    const [, a, bb] = xyzToLab(x, y, z);
    return { hue: (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360, chroma: Math.sqrt(a * a + bb * bb) };
}

function atTone(hue, chroma, tone) {
    const rad = hue * Math.PI / 180;
    const a = chroma * Math.cos(rad), b = chroma * Math.sin(rad);
    const [x, y, z] = labToXyz(tone, a, b);
    const [r, g, bb] = xyzToRgb(x, y, z);
    return rgbToHex(r, g, bb);
}

const LIGHT_TONES = { primary: 40, onPrimary: 100, primaryContainer: 90, onPrimaryContainer: 10 };
const DARK_TONES = { primary: 80, onPrimary: 20, primaryContainer: 30, onPrimaryContainer: 90 };
const MAX_CHROMA = 48;

export function dynamicAccentFromHex(sourceHex, dark = false) {
    const { hue, chroma: rawChroma } = hueChromaFromHex(sourceHex);
    const chroma = Math.min(rawChroma, MAX_CHROMA);
    const tones = dark ? DARK_TONES : LIGHT_TONES;
    return {
        primary: atTone(hue, chroma, tones.primary),
        onPrimary: atTone(hue, chroma, tones.onPrimary),
        primaryContainer: atTone(hue, chroma, tones.primaryContainer),
        onPrimaryContainer: atTone(hue, chroma, tones.onPrimaryContainer),
    };
}

export function dynamicAccentStyleVars(sourceHex, dark = false) {
    const c = dynamicAccentFromHex(sourceHex, dark);
    return {
        '--dyn-accent': c.primary,
        '--dyn-accent-fg': c.onPrimary,
        '--dyn-accent-container': c.primaryContainer,
        '--dyn-accent-container-fg': c.onPrimaryContainer,
    };
}
