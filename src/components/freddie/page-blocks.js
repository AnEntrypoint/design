import * as webjsx from '../../../vendor/webjsx/index.js';

const h = webjsx.createElement;

export function pre(obj) {
    return h('pre', { class: 'fd-pre' }, typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
}

export function form(opts) {
    const { fields = [], submit = 'submit', onSubmit } = opts;
    return h('form', { class: 'row-form', onsubmit: (ev) => { ev.preventDefault(); onSubmit && onSubmit(ev); } },
        ...fields.map(f => f.kind === 'textarea'
            ? h('textarea', { name: f.name, placeholder: f.placeholder || '', rows: f.rows || 4 })
            : h('input', { name: f.name, type: f.type || 'text', placeholder: f.placeholder || '', value: f.value || '', required: f.required ? 'true' : null })),
        h('button', { type: 'submit', class: 'btn-primary' }, submit));
}
