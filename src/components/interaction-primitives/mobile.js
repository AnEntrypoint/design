
const MOBILE_QUERY = '(max-width: 480px)';

export function isMobileNow() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(MOBILE_QUERY).matches;
}

export function onMobileChange(cb) {
    if (typeof window === 'undefined' || !window.matchMedia) return () => {};
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = () => cb(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => {
        if (mql.removeEventListener) mql.removeEventListener('change', handler);
        else mql.removeListener(handler);
    };
}
