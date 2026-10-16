
import * as webjsx from '../../vendor/webjsx/index.js';
import { CommandPalette } from './overlay-primitives.js';

let _paletteHost = null;
function ensurePaletteHost() {
    if (typeof document === 'undefined') return null;
    if (_paletteHost && document.body.contains(_paletteHost)) return _paletteHost;
    _paletteHost = document.createElement('div');
    _paletteHost.className = 'ds-command-palette-host';
    document.body.appendChild(_paletteHost);
    return _paletteHost;
}

export function closeCommandPalette() {
    const host = ensurePaletteHost();
    if (host) webjsx.applyDiff(host, null);
}

export function openCommandPalette({ actions = [], onSelect } = {}) {
    const host = ensurePaletteHost();
    if (!host) return;
    const handleSelect = (item) => {
        closeCommandPalette();
        if (onSelect) onSelect(item);
        else if (item && typeof item.action === 'function') item.action();
        else if (item && typeof item.run === 'function') item.run();
    };
    webjsx.applyDiff(host, CommandPalette({
        open: true, items: actions,
        onSelect: handleSelect,
        onClose: closeCommandPalette,
    }));
}
