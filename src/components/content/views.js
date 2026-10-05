import * as webjsx from '../../../vendor/webjsx/index.js';
import { Heading, Lede, Dot } from '../shell.js';
import { Row } from './row.js';
import { Panel, Section, Receipt, Changelog } from './panel.js';
import { Hero, Manifesto } from './hero.js';
import { Install } from './cli.js';
import { WorksList, WritingList } from './lists.js';
const h = webjsx.createElement;

export function HomeView({ state = {}, onNav, onToggleWork, works = [], posts = [], manifesto = [], currentlyShipping } = {}) {
    return [
        Hero({
            eyebrow: 'an entrypoint',
            title: 'Small, weird, useful tools — built in public.',
            body: '247420 is a creative collective of eight, scattered across three timezones. We have been shipping open-source tools for the web since 2018.',
            accent: 'Some become the future. Most don\'t. That\'s the deal.'
        }),
        currentlyShipping ? Section({
            title: 'currently shipping',
            children: Panel({
                kind: 'wide',
                children: currentlyShipping.map((row, i) => {
                    const dotNode = Dot({ tone: row.live ? 'live' : 'idle' });
                    dotNode.props = { ...dotNode.props, 'aria-label': row.live ? 'live status' : 'idle status' };
                    return Row({
                        key: i,
                        code: dotNode,
                        title: row.title, sub: row.sub, meta: row.meta
                    });
                })
            })
        }) : null,
        works.length ? Section({
            title: 'Everything else.',
            children: WorksList({ works, openedIndex: state.opened ?? -1, onToggle: onToggleWork })
        }) : null,
        posts.length ? Section({
            title: 'When we have something to say.',
            children: WritingList({ posts })
        }) : null,
        manifesto.length ? Section({
            title: 'Eight people, three timezones, one ongoing conversation.',
            children: Manifesto({ paragraphs: manifesto })
        }) : null
    ].filter(Boolean);
}

export function ProjectView({ project = {}, copied, onCopy } = {}) {
    return [
        h('div', { class: 'ds-prose' },
            Heading({ level: 1, children: project.name }),
            Lede({ children: project.tagline })
        ),
        project.install ? [
            Heading({ level: 3, children: 'install' }),
            Install({ cmd: project.install, copied, onCopy }),
        ] : null,
        project.receipt ? [
            Heading({ level: 3, children: 'by the numbers' }),
            Receipt({ rows: project.receipt }),
        ] : null,
        project.changelog ? [
            Heading({ level: 3, children: 'recent releases' }),
            Changelog({ entries: project.changelog })
        ] : null
    ].filter(Boolean).flat();
}
