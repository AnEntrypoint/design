// avatarStyle — the one place the community kit turns a member's colour into
// the two custom properties community.css reads (--avatar-bg / --avatar-fg).
//
// This existed as four byte-identical private copies (moderation.js,
// presence.js, search.js, webhooks.js). A contrast fix applied to one of them
// would have silently missed the other three, which is the whole failure mode
// the kit's own token discipline exists to prevent.
//
// Returns null (not '') when there is no colour, so a caller can pass the
// result straight through as a `style` prop: webjsx writes nothing for a
// missing attribute rather than an empty style="".

import { avatarContrastFg } from '../content.js';

export function avatarStyle(color) {
    if (!color) return null;
    const fg = avatarContrastFg(color);
    return fg ? `--avatar-bg:${color};--avatar-fg:${fg}` : `--avatar-bg:${color}`;
}
