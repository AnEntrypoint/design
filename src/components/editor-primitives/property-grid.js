
import * as webjsx from '../../../vendor/webjsx/index.js';
import { kids } from './shared.js';
const h = webjsx.createElement;

export function PropertyGrid({ children } = {}) {
    return h('div', { class: 'ds-ep-propgrid', role: 'group' }, ...kids(children));
}

export function PropertyField({ label, hint, inline = false, children } = {}) {
    return h('label', { class: 'ds-ep-propfield' + (inline ? ' inline' : '') },
        h('span', { class: 'ds-ep-propfield-label' }, label),
        h('span', { class: 'ds-ep-propfield-value' }, ...kids(children)),
        hint != null ? h('span', { class: 'ds-ep-propfield-hint' }, hint) : null
    );
}

export function PropertyGridRow({ children, key } = {}) {
    return h('div', { key, class: 'ds-ep-propgrid-row' }, ...kids(children));
}

export function InlineEditableField({ value = '', placeholder, onInput, onChange, error, multiline = false, rows = 3, ariaLabel, disabled = false } = {}) {
    const cls = 'ds-ep-inline-input' + (error ? ' has-error' : '');
    const common = {
        class: cls,
        value,
        placeholder,
        disabled: disabled ? 'disabled' : null,
        'aria-label': ariaLabel,
        'aria-invalid': error ? 'true' : null,
        oninput: onInput ? (e) => onInput(e.target.value, e) : null,
        onchange: onChange ? (e) => onChange(e.target.value, e) : null,
    };
    return multiline
        ? h('textarea', { ...common, rows })
        : h('input', { ...common, type: 'text' });
}
