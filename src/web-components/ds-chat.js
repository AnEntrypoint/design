import * as webjsx from '../../vendor/webjsx/index.js';
import { Chat, ChatComposer } from '../components/chat.js';
import { register } from '../debug.js';

let _stats = { mounts: 0, sends: 0 };

class DsChat extends HTMLElement {
    static get observedAttributes() { return ['title', 'sub', 'placeholder']; }

    constructor() {
        super();
        this._messages = [];
        this._draft = '';
        this._title = 'chat';
        this._sub = '';
        this._placeholder = 'message…';
    }

    set messages(v) { this._messages = Array.isArray(v) ? v : []; this._render(); }
    get messages() { return this._messages; }

    connectedCallback() {
        if (this.hasAttribute('messages')) {
            try { this._messages = JSON.parse(this.getAttribute('messages')); } catch {}
        }
        this._title = this.getAttribute('title') || this._title;
        this._sub = this.getAttribute('sub') || '';
        this._placeholder = this.getAttribute('placeholder') || this._placeholder;
        _stats.mounts += 1;
        this._render();
    }

    attributeChangedCallback(name, _old, val) {
        if (name === 'title') this._title = val || 'chat';
        if (name === 'sub') this._sub = val || '';
        if (name === 'placeholder') this._placeholder = val || 'message…';
        this._render();
    }

    pushMessage(msg) {
        this._messages = [...this._messages, msg];
        this._render();
    }

    _render() {
        const onSend = (text) => {
            _stats.sends += 1;
            this.dispatchEvent(new CustomEvent('send', { detail: { text }, bubbles: true, composed: true }));
        };
        const onInput = (v) => { this._draft = v; this._render(); };
        const view = Chat({
            title: this._title,
            sub: this._sub,
            messages: this._messages,
            composer: ChatComposer({
                value: this._draft,
                placeholder: this._placeholder,
                onInput,
                onSend
            })
        });
        webjsx.applyDiff(this, view);
    }
}

let _registered = false;
export function registerChatElement() {
    if (_registered) return;
    if (!customElements.get('ds-chat')) customElements.define('ds-chat', DsChat);
    _registered = true;
}

register('ds-chat', () => ({ registered: _registered, ..._stats, instances: document.querySelectorAll('ds-chat').length }));

export { DsChat };
