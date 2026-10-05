import * as webjsx from '../../../vendor/webjsx/index.js';
import { Panel } from './panel.js';
import { Btn } from '../shell.js';
const h = webjsx.createElement;

export function Install({ cmd, copied, onCopy }) {
    return h('div', { class: 'cli' },
        h('span', { class: 'prompt' }, '$'),
        h('span', { class: 'cmd' }, cmd),
        Btn({
            class: 'copy', size: 'sm',
            onClick: () => onCopy && onCopy(cmd),
            'aria-label': copied ? 'copied to clipboard' : 'copy install command',
            children: h('span', { 'aria-live': 'polite' }, copied ? 'copied' : 'copy')
        })
    );
}

export function CliBlock({ lines = [], heading = 'quick start', className = '' } = {}) {
    if (!lines || !lines.length) return null;
    const rows = lines.map((l, i) => {
        const isComment = l && l.kind === 'cmt';
        const text = l && l.text != null ? l.text : '';
        return isComment
            ? h('div', { key: 'q' + i, class: 'ds-cli-comment' }, text)
            : h('div', { key: 'q' + i, class: 'ds-cli-row' },
                h('span', { class: 'prompt' }, '$'),
                h('span', { class: 'cmd' }, text));
    });
    const body = h('div', { class: 'ds-cli-block' + (className ? ' ' + className : '') }, ...rows);
    return heading == null ? body : Panel({ title: heading, children: body });
}
