import * as webjsx from '../../../vendor/webjsx/index.js';
const h = webjsx.createElement;

export const ICON_PATHS = {
    'g3-gear': '<path fill="currentColor" fill-rule="evenodd" d="M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>',
    'g3-camera': '<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M3 7.5A1.5 1.5 0 0 1 4.5 6H14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 14 18H4.5A1.5 1.5 0 0 1 3 16.5v-9ZM15.5 10.5 21 7.5v9l-5.5-3v-3Z\"/>',
    'g3-mic': '<path fill="currentColor" d="M12 2a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z"/><path fill="currentColor" d="M6 10a1 1 0 0 0-2 0 8 8 0 0 0 7 7.94V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.06A8 8 0 0 0 20 10a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z"/>',
    'g3-micoff': '<path fill="currentColor" d="m2.7 22.7 20-20a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4ZM10.8 17.32c-.21.2-.2.53.04.68A7.99 7.99 0 0 0 13 18.94V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-0v-1.06A8 8 0 0 0 20 10a1 1 0 1 0-2 0 6 6 0 0 1-6.08 6c-.22 0-.4.09-.55.24l-.57.58ZM15.6 9.97a.5.5 0 0 0-.85-.35l-3.9 3.9a.5.5 0 0 0 .34.86 4 4 0 0 0 4.41-4.41ZM4.06 13.26a1 1 0 0 0 1.85-.77A6 6 0 0 1 6 10a1 1 0 0 0-2 0c0 1.12.23 2.2.65 3.17l-.59.09ZM8 6v3.6c0 .45.54.67.85.35l6.66-6.66c.3-.3.28-.8-.06-1.04A4 4 0 0 0 8 6Z"/>',
    'g3-hangup': '<path fill="currentColor" d="M21.1 13.6c-.5.9-1.6 1.2-2.5.8l-2.4-1.1a1.9 1.9 0 0 1-1.1-1.9l.1-1.1a10 10 0 0 0-6.4 0l.1 1.1c.1.8-.4 1.6-1.1 1.9l-2.4 1.1c-.9.4-2 .1-2.5-.8l-.6-1a2 2 0 0 1 .3-2.4C5 7.9 8.4 6.5 12 6.5s7 1.4 9.4 3.7c.6.6.8 1.6.3 2.4l-.6 1Z"/>',
    'game3-home': '<path fill="currentColor" fill-rule="evenodd" d="M12 2C6.48 2 2 6.04 2 11c0 2.62 1.25 4.97 3.24 6.62-.12 1.3-.6 2.6-1.5 3.6a.5.5 0 0 0 .4.83c2-.06 3.8-.8 5.1-1.85.9.2 1.8.3 2.76.3 5.52 0 10-4.04 10-9S17.52 2 12 2Zm-5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    mic: '<path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    'mic-off': '<path d="M9 9v2a3 3 0 0 0 4.5 2.6M15 11V6a3 3 0 0 0-5.9-.8"/><path d="M5 11a7 7 0 0 0 11.5 5.4M12 18v3"/><path d="m4 4 16 16"/>',
    speaker: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    'speaker-off': '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m17 9 4 6M21 9l-4 6"/>',
    camera: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
    'camera-off': '<path d="M3 6h13v6M16 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 1.6-2M21 8v8l-5-3"/><path d="m4 4 16 16"/>',
    screen: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    phone: '<path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    members: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    paperclip: '<path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7.5-7.5"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14a4 4 0 0 0 8 0"/><path d="M9 9h.01M15 9h.01"/>',
    'more-horizontal': '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    'arrow-up': '<path d="M12 19V5M5 12l7-7 7 7"/>',
    'arrow-top-left': '<path d="M19 19 5 5"/><path d="M5 13V5h8"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14"/>',
    forum: '<path d="M4 5h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
    page: '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M8 13h8M8 17h6"/>',
    thread: '<path d="M5 6h14M5 11h14M5 16h8"/><circle cx="17" cy="17" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-check': '<path d="M18 6 7 17l-3-3"/><path d="m22 10-7.5 7.5L13 16"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-down-fill': '<path fill="currentColor" d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"/>',
    'ref-events': '<path d="M7 1a1 1 0 0 1 1 1v1h8V2a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h1V2a1 1 0 0 1 1-1ZM4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9H4Zm3 3h2v2H7v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-8 4h2v2H7v-2Zm4 0h2v2h-2v-2Z"/>',
    'ref-leaderboard': '<path fill-rule="evenodd" d="M6 2h12v2h3a1 1 0 0 1 1 1v2a5 5 0 0 1-4.3 4.95A6 6 0 0 1 13 15.9V19h3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h3v-3.1a6 6 0 0 1-4.7-3.95A5 5 0 0 1 2 7V5a1 1 0 0 1 1-1h3V2Zm0 4H4v1a3 3 0 0 0 2 2.83V6Zm12 0v3.83A3 3 0 0 0 20 7V6h-2Z"/>',
    'ref-pins': '<path d="M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5 0 0 0-.7 0l-.03.03a3 3 0 0 0 0 4.24L13 5l-2.92 2.92-3.65-.34a2 2 0 0 0-1.6.58l-.62.63a1 1 0 0 0 0 1.42l9.58 9.58a1 1 0 0 0 1.42 0l.63-.63a2 2 0 0 0 .58-1.6l-.34-3.64L19 11l.38.38ZM9.07 17.07a.5.5 0 0 1-.08.77l-5.15 3.43a.5.5 0 0 1-.63-.06l-.42-.42a.5.5 0 0 1-.06-.63L6.16 15a.5.5 0 0 1 .77-.08l2.14 2.14Z"/>',
    'search-ref': '<path d=\"M15.62 17.03a9 9 0 1 1 1.41-1.41l4.68 4.67a1 1 0 0 1-1.42 1.42l-4.67-4.68ZM17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z\"/>',
    'inbox': '<path d=\"M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5ZM4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5h-2.65c-.5 0-.85.5-.85 1a3 3 0 1 1-6 0c0-.5-.35-1-.85-1H5.5A1.5 1.5 0 0 1 4 11.5v-6Z\"/>',
    'mute-channel': '<path d=\"M9.7 2.89c.18-.07.32-.24.37-.43a2 2 0 0 1 3.86 0c.05.2.19.36.38.43A7 7 0 0 1 19 9.5v2.09c0 .12.05.24.13.33l1.1 1.22a3 3 0 0 1 .77 2.01v.33c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5v-.33c0-.74.27-1.46.77-2.01l1.1-1.22a.5.5 0 0 0 .13-.33V9.5a7 7 0 0 1 4.7-6.61ZM9.18 19.84A.16.16 0 0 0 9 20a3 3 0 1 0 6 0c0-.1-.09-.17-.18-.16a24.86 24.86 0 0 1-5.64 0Z\"/>',
    'ref-members': '<path d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1ZM18.44 17.27c.15.43.54.73 1 .73h1.06c.83 0 1.5-.67 1.5-1.5a7.5 7.5 0 0 0-6.5-7.43c-.55-.08-.99.38-1.1.92-.06.3-.15.6-.26.87-.23.58-.05 1.3.47 1.630a9.53 9.53 0 0 1 3.83 4.78ZM12.5 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2 20.5a7.5 7.5 0 0 1 15 0c0 .83-.67 1.5-1.5 1.5H3.5A1.5 1.5 0 0 1 2 20.5Z"/>',
    'ref-sticker': '<path fill-rule="evenodd" d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h9.17a3 3 0 0 0 2.12-.88l4.83-4.83A3 3 0 0 0 22 14.17V5a3 3 0 0 0-3-3H5Zm9 18v-3a3 3 0 0 1 3-3h3v.17a1 1 0 0 1-.3.7l-4.82 4.84a1 1 0 0 1-.71.29H14ZM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-8 2.4a1 1 0 0 1 1.38.3A3.7 3.7 0 0 0 12 14.4c.3 0 .6-.03.88-.1a1 1 0 0 1 .48 1.94A5.7 5.7 0 0 1 7.2 13.8a1 1 0 0 1 .3-1.4Z"/>',
    'ref-emoji': '<path fill-rule="evenodd" d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22ZM6.5 13a1 1 0 0 0-.98 1.2 6.6 6.6 0 0 0 12.96 0A1 1 0 0 0 17.5 13h-11ZM9 7.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>',
    'voice-disconnect': '<path fill="currentColor" d="M21.1 13.6c-.5.9-1.6 1.2-2.5.8l-2.4-1.1a1.9 1.9 0 0 1-1.1-1.9l.1-1.1a10 10 0 0 0-6.4 0l.1 1.1c.1.8-.4 1.6-1.1 1.9l-2.4 1.1c-.9.4-2 .1-2.5-.8l-.6-1a2 2 0 0 1 .3-2.4C5 7.9 8.4 6.5 12 6.5s7 1.4 9.4 3.7c.6.6.8 1.6.3 2.4l-.6 1Z"/>',
    'chevron-up': '<path d="m6 15 6-6 6 6"/>',
    'arrow-down': '<path d="M12 5v14M5 12l7 7 7-7"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    play: '<path d="M6 4v16l14-8z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    'circle-dot': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    dot: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
    square: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
    activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2-2.4 3.7M12 17h.01"/>',
    warn: '<path d="M10.3 4 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    'file-pdf': '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    'file-zip': '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M11 4v3M11 9v3M11 14v3"/>',
    'file-video': '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="m10 12 4 2.5L10 17z"/>',
    'file-audio': '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 17v-3l4-1v3"/><circle cx="8" cy="17" r="1"/><circle cx="12" cy="16" r="1"/>',
    'file-sheet': '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h8M12 11v8"/>',
    'file-code': '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="m10 12-2 2 2 2M14 12l2 2-2 2"/>',
    'file-text': '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h6"/>',
    file: '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/>',
    paw: '<circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="5" cy="13" r="1.8"/><circle cx="19" cy="13" r="1.8"/><path d="M12 13.5c-3 0-5.5 2.2-5.5 4.7 0 1.5 1.3 2.3 2.8 1.8.9-.3 1.7-.7 2.7-.7s1.8.4 2.7.7c1.5.5 2.8-.3 2.8-1.8 0-2.5-2.5-4.7-5.5-4.7z"/>',
    pencil: '<path d="M4 20h4L19 9a2 2 0 0 0-3-3L5 17z"/><path d="M14 6l3 3"/>',
    'skip-forward': '<path d="M5 5v14l9-7z"/><path d="M19 5v14"/>',
    'chevron-left': '<path d="m15 6-6 6 6 6"/>',
    trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
    'external-link': '<path d="M14 4h6v6M20 4l-9 9M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    'folder-open': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2H5l-2 9z"/><path d="M3 18l2-9h17l-2 9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    rows: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    'rows-tight': '<path d="M4 5h16M4 9h16M4 13h16M4 17h16"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    'file-image': '<path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><circle cx="9.5" cy="12.5" r="1.5"/><path d="M18 19l-4-4-3 3-2-2-3 3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    'corner-up-left': '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v6"/>',
    'g3-pin': '<path fill="currentColor" d="M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5 0 0 0-.7 0l-.03.03a3 3 0 0 0 0 4.24L13 5l-2.92 2.92-3.65-.34a2 2 0 0 0-1.6.58l-.62.63a1 1 0 0 0 0 1.42l9.58 9.58a1 1 0 0 0 1.42 0l.63-.63a2 2 0 0 0 .58-1.6l-.34-3.64L19 11l.38.38ZM9.07 17.07a.5.5 0 0 1-.08.77l-5.15 3.43a.5.5 0 0 1-.63-.06l-.42-.42a.5.5 0 0 1-.06-.63L6.16 15a.5.5 0 0 1 .77-.08l2.14 2.14Z"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    clipboard: '<rect x="8" y="4" width="8" height="4" rx="1"/><path d="M8 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"/>',
    cursor: '<path d="M5 3l14 8-6.5 1.5L11 20z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M2 12s3.5-7 10-7c1.7 0 3.2.4 4.5 1.1M22 12s-3.5 7-10 7c-1.7 0-3.2-.4-4.5-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m4 4 16 16"/>',
    github: '<path d="M12 3a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.7c-2.2.4-2.7-1-2.9-1.6-.1-.3-.5-1-1-1.2-.3-.1-.6-.4 0-.5.9-.1 1.5.8 1.7 1.1.7 1.1 1.7.8 2.1.6.1-.5.3-.8.6-1-2.2-.3-3.4-1.4-3.4-3.4 0-.8.3-1.5.7-2-.1-.3-.3-1.1.1-2.2 0 0 .8-.2 2.5.9a8 8 0 0 1 4.5 0c1.7-1.1 2.5-.9 2.5-.9.4 1.1.2 1.9.1 2.2.5.5.7 1.2.7 2 0 2-1.2 3.1-3.4 3.4.3.3.6.8.6 1.5v2.1c0 .2.1.5.5.4A8 8 0 0 0 12 3z"/>',
    google: '<path d="M18.4 7.2A7.5 7.5 0 1 0 19.5 12H12"/>',
    sso: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    minus: '<path d="M5 12h14"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    cloud: '<path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.8A4 4 0 0 0 6.5 16"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'
};

function iconAttrs(name, size) {
    if (String(name).startsWith('ref-')) return { class: 'ds-icon ds-icon-' + name, width: String(size), height: String(size), viewBox: '0 0 24 24', fill: 'currentColor', stroke: 'none', 'aria-hidden': 'true' };
    return {
        class: 'ds-icon ds-icon-' + name,
        width: String(size), height: String(size), viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', 'stroke-width': 'var(--ds-icon-stroke, 1.6)',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
    };
}
function iconArgs(name, size) {
    if (name && typeof name === 'object') ({ name, size = 16 } = name);
    return { name, size };
}
export function iconMarkup(name, { size = 16 } = {}) {
    ({ name, size } = iconArgs(name, size));
    const inner = ICON_PATHS[name];
    if (!inner) return '';
    const attrs = Object.entries(iconAttrs(name, size)).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `<svg ${attrs}>${inner}</svg>`;
}
/**
 * Renders a monochrome line icon from ICON_PATHS as a webjsx vnode. Accepts
 * either call shape: `Icon('search', { size: 20 })` (the primary,
 * historical signature) or `Icon({ name: 'search', size: 20 })` (a single
 * props object, matching every other factory in this kit): both resolve
 * through the same iconArgs() normalization below. An out-of-set name
 * renders an empty `<span class="glyph">` rather than throwing.
 * @example h('button', {}, Icon('settings', { size: 16 }), 'Settings')
 * @example h('button', {}, Icon({ name: 'settings', size: 16 }), 'Settings')
 */
export function Icon(name, { size = 16 } = {}) {
    ({ name, size } = iconArgs(name, size));
    const inner = ICON_PATHS[name];
    if (!inner) return h('span', { class: 'glyph', 'aria-hidden': 'true' }, '');
    return h('svg', { ...iconAttrs(name, size), dangerouslySetInnerHTML: { __html: inner } });
}
