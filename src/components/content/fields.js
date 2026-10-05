import * as webjsx from '../../../vendor/webjsx/index.js';
import { Icon } from '../shell.js';
const h = webjsx.createElement;

export function SearchInput({ value = '', placeholder = 'search…', onInput, onSubmit, name = 'q', key, label, resultCount }) {
    const doClear = (e) => { if (onInput) onInput('', e); };
    const input = h('input', {
        key: 'i',
        type: 'search',
        name,
        class: 'ds-search-input',
        placeholder,
        'aria-label': label || placeholder,
        value,
        oninput: onInput ? (e) => onInput(e.target.value, e) : null,
        onkeydown: (e) => {
            if (e.key === 'Escape' && value) { e.preventDefault(); e.stopPropagation(); doClear(e); return; }
            if (onSubmit && e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) onSubmit(e.target.value, e);
        }
    });
    const clearBtn = value
        ? h('button', {
            key: 'clr', type: 'button', class: 'ds-search-clear',
            'aria-label': 'clear search',
            onclick: doClear,
        }, Icon('x'))
        : null;
    return h('span', { key, class: 'ds-search-input-wrap' },
        h('span', { key: 'fld', class: 'ds-search-field' },
            h('span', { key: 'ic', class: 'ds-search-icon', 'aria-hidden': 'true' }, Icon('search', { size: 15 })),
            input),
        clearBtn,
        resultCount != null ? h('span', { key: 'cnt', class: 'sr-only', role: 'status', 'aria-live': 'polite' }, resultCount) : null);
}

/**
 * A single-line or multi-line text field.
 *
 * `suggestions` turns it into a COMBO BOX rather than a second control type: a
 * real `<datalist>`, so the values are offered and filtered by the browser
 * itself, with no popup to render, no keystroke handler, nothing to re-render as
 * someone types, and typing a value that is not on the list stays completely
 * unblocked (which is the whole difference between this and `Select`). Native is
 * the right mechanism here specifically because it costs zero latency on a field
 * somebody is typing into, and because a phone gives it the platform's own
 * picker. Ignored for `multiline`, since `<datalist>` only binds to `<input>`.
 *
 * Pass `name` (or `key`) alongside `suggestions`: the datalist's id is derived
 * from it, so two suggestion fields on one screen need distinct ones.
 */
export function TextField({ label, value = '', type = 'text', placeholder = '', onInput, onChange, name, key, hint, multiline, rows = 4, maxLength, min, max, error, title, size = 'md', suggestions, 'aria-label': ariaLabel, 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDescribedBy }) {
    const sizeCls = size === 'sm' ? ' ds-field--sm' : (size === 'lg' ? ' ds-field--lg' : '');
    const errorId = error != null ? ((key ? key : 'tf') + '-err') : null;
    const describedBy = ariaDescribedBy || errorId || null;
    const sugg = (!multiline && Array.isArray(suggestions) && suggestions.length) ? suggestions : null;
    const listId = sugg ? ('ds-dl-' + String(name || key || 'field')) : null;
    const input = multiline
        ? h('textarea', {
            key: 'i', name, rows, placeholder, value,
            maxlength: maxLength != null ? maxLength : null,
            'aria-label': ariaLabel || null,
            'aria-invalid': error != null ? 'true' : (ariaInvalid || null),
            'aria-describedby': describedBy,
            title: title || null,
            oninput: onInput ? (e) => onInput(e.target.value, e) : null,
            onchange: onChange ? (e) => onChange(e.target.value, e) : null
        })
        : h('input', {
            key: 'i', type, name, placeholder, value,
            maxlength: maxLength != null ? maxLength : null,
            min: min != null ? String(min) : null,
            max: max != null ? String(max) : null,
            list: listId,
            autocomplete: sugg ? 'off' : null,
            'aria-label': ariaLabel || null,
            'aria-invalid': error != null ? 'true' : (ariaInvalid || null),
            'aria-describedby': describedBy,
            title: title || null,
            oninput: onInput ? (e) => onInput(e.target.value, e) : null,
            onchange: onChange ? (e) => onChange(e.target.value, e) : null
        });
    return h('label', { key, class: 'ds-field' + sizeCls },
        ...[
            label != null ? h('span', { key: 'l', class: 'ds-field-label' }, label) : null,
            input,
            sugg ? h('datalist', { key: 'dl', id: listId },
                ...sugg.map((s) => {
                    const v = typeof s === 'string' ? s : (s && s.value != null ? String(s.value) : '');
                    const lab = (typeof s === 'object' && s && s.label != null) ? String(s.label) : null;
                    return lab != null
                        ? h('option', { key: 'o-' + v, value: v }, lab)
                        : h('option', { key: 'o-' + v, value: v });
                })) : null,
            error != null ? h('span', { key: 'e', id: errorId, class: 'ds-field-error', role: 'alert', 'aria-live': 'polite', 'aria-atomic': 'true' }, error) : null,
            maxLength != null ? h('span', { key: 'c', class: 'ds-field-count' }, String(value.length) + '/' + maxLength) : null,
            hint != null ? h('span', { key: 'h', class: 'ds-field-hint' }, hint) : null
        ].filter(Boolean)
    );
}

export function Select({ label, value = '', options = [], onChange, name, key, placeholder, hint, title, size = 'md', 'aria-label': ariaLabel }) {
    const sizeCls = size === 'sm' ? ' ds-field--sm' : (size === 'lg' ? ' ds-field--lg' : '');
    const opts = [];
    if (placeholder != null) opts.push(h('option', { key: '_ph', value: '', disabled: true, selected: value === '' || value == null }, placeholder));
    for (const o of options) {
        const id = typeof o === 'string' ? o : (o.value != null ? o.value : o.id);
        const lab = typeof o === 'string' ? o : (o.label != null ? o.label : (o.id || o.value));
        opts.push(h('option', { key: 'o-' + id, value: id, selected: id === value }, lab));
    }
    const bare = label == null && hint == null && size === 'md';
    const select = h('select', {
        key: bare && key != null ? key : 'i', name, class: 'ds-select',
        'aria-label': ariaLabel || (label == null ? (title || placeholder || name) : null),
        title,
        onchange: onChange ? (e) => onChange(e.target.value, e) : null
    }, ...opts);
    if (bare) return select;
    if (label == null && hint == null) return h('label', { key, class: 'ds-field' + sizeCls }, select);
    return h('label', { key, class: 'ds-field' + sizeCls },
        label != null ? h('span', { key: 'l', class: 'ds-field-label' }, label) : null,
        select,
        hint != null ? h('span', { key: 'h', class: 'ds-field-hint' }, hint) : null
    );
}

export function Form({ fields = [], submit = 'submit', onSubmit, columns = 1 }) {
    const cols = columns > 1 ? String(columns) : null;
    return h('form', { class: 'row-form', 'data-columns': cols, onsubmit: (ev) => { ev.preventDefault(); onSubmit && onSubmit(ev); } },
        ...fields.map((f, i) => {
            const fieldId = 'ds-form-' + (f.name || 'field') + '-' + i;
            const labelText = f.label != null ? f.label : (f.placeholder || f.name || '');
            const control = f.kind === 'textarea'
                ? h('textarea', { key: 'i', id: fieldId, name: f.name, placeholder: f.placeholder || '', rows: f.rows || 4, required: f.required ? true : null })
                : h('input', { key: 'i', id: fieldId, name: f.name, type: f.type || 'text', placeholder: f.placeholder || '', value: f.value || '', required: f.required ? true : null });
            return h('label', { key: i, class: 'ds-field', for: fieldId },
                labelText !== '' ? h('span', { key: 'l', class: 'ds-field-label' }, labelText) : null,
                control);
        }),
        h('button', { type: 'submit', class: 'btn-primary' }, submit));
}

/**
 * Ruled writing lines that exist only on paper.
 *
 * A record printed to be READ wants a screen's "nothing recorded" placeholder.
 * A record printed to be FILLED IN by hand wants the opposite: no placeholder
 * text at all, and enough ruled space to write the answer. The same page is
 * often used both ways: an operator prints the case to carry into the field,
 * and writes into the gaps. This renders nothing on screen and, in print, the
 * blank lines to write on.
 *
 * Pair it with `ds-print-blank` on whatever placeholder the field shows on
 * screen, so the two swap over cleanly at the page boundary.
 *
 * Lines are ruled with a real border rather than a background gradient on
 * purpose: browsers omit background graphics from printing by default, so a
 * gradient rule silently prints as nothing on the common setting.
 *
 * @param {number} lines How many lines to rule. Clamped to 1..20.
 * @param {string} key webjsx list key.
 */
export function FillLines({ lines = 1, key } = {}) {
    const n = Math.min(20, Math.max(1, Math.floor(Number(lines) || 1)));
    return h('span', { class: 'ds-fill-lines', key, 'aria-hidden': 'true' },
        ...Array.from({ length: n }, (_, i) => h('span', { key: 'r' + i, class: 'ds-fill-line' })));
}
