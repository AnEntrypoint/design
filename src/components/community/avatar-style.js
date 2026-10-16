
import { avatarContrastFg } from '../content.js';

export function avatarStyle(color) {
    if (!color) return null;
    const fg = avatarContrastFg(color);
    return fg ? `--avatar-bg:${color};--avatar-fg:${fg}` : `--avatar-bg:${color}`;
}
