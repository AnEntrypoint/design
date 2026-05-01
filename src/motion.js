function hasDom() {
    return typeof document !== 'undefined';
}

export function shouldReduceMotion() {
    return true;
}

export function installMotion() {
}

export function animateElement(el, name, opts = {}) {
    return Promise.resolve(false);
}

export function animateSelector(selector, name, opts = {}) {
    return Promise.resolve(false);
}

export function animateTree(root, opts = {}) {
    return 0;
}
