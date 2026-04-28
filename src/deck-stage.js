// Lazy registration: <deck-stage> requires HTMLElement / customElements,
// which only exist in the browser. Calling registerDeckStage() in a
// browser context performs the side-effect import and defines the element.
let _registered = false;
export async function registerDeckStage() {
    if (_registered) return customElements.get('deck-stage');
    if (typeof customElements === 'undefined' || typeof HTMLElement === 'undefined') {
        return null;
    }
    await import('../slides/deck-stage.js');
    _registered = true;
    return customElements.get('deck-stage');
}

export function getDeckStage() {
    return (typeof customElements !== 'undefined') ? customElements.get('deck-stage') : null;
}
