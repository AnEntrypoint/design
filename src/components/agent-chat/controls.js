import * as webjsx from '../../../vendor/webjsx/index.js';
import { Select } from '../content.js';
import { Btn } from '../shell.js';
import { BreadcrumbPath } from '../files.js';

const h = webjsx.createElement;

export function AgentControls({ agents, selectedAgent, models, selectedModel, busy, status, modelsLoading, agentsLoading,
                         onSelectAgent, onSelectModel, onNewChat, onStop, exportActions }) {
  const agentOptions = (agents || []).map((a) => ({
    value: a.id,
    label: a.name + (a.available === false ? (a.npxInstallable ? ' (via npx)' : ' (not installed)') : ''),
    disabled: a.available === false && !a.npxInstallable,
  }));
  const showModels = (models || []).length > 0;
  return h('div', { class: 'agentchat-controls' },
    (agentsLoading && !agentOptions.length)
      ? Select({ key: 'agentsel', value: '', placeholder: 'loading agents…', title: 'Loading agents', disabled: true, options: [] })
      : (agentOptions.length
          ? Select({
              key: 'agentsel', value: selectedAgent, placeholder: 'select agent',
              title: 'Select agent', options: agentOptions,
              onChange: (v) => onSelectAgent && onSelectAgent(v),
            })
          : null),
    showModels
      ? Select({
          key: 'modelsel', value: selectedModel, placeholder: 'select model',
          title: 'Select model', options: (models || []).map((m) => ({ value: m.id, label: m.name || m.id })),
          onChange: (v) => onSelectModel && onSelectModel(v),
        })
      : (modelsLoading
          ? Select({ key: 'modelsel', value: '', placeholder: 'loading models…', title: 'Loading models', disabled: true, options: [] })
          : null),
    busy
      ? Btn({ key: 'stop', onClick: () => onStop && onStop(), children: 'stop', title: 'Stop streaming' })
      : Btn({ key: 'new', onClick: () => onNewChat && onNewChat(), children: 'new', title: 'New chat' }),
    h('span', { key: 'st', class: 'agentchat-status', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' },
      h('span', { class: 'status-dot-disc ' + (busy ? 'status-dot-live' : ''), 'aria-hidden': 'true' }),
      h('span', {}, status || (busy ? 'streaming…' : 'ready'))),
    ...(exportActions && exportActions.length
      ? exportActions.map((a, i) => h('button', {
          key: 'exp' + i, type: 'button', class: 'agentchat-export-act',
          title: a.title || a.label,
          onclick: () => a.onClick && a.onClick(),
        }, a.label))
      : []),
  );
}

export function CwdBar({ cwd, editing, draft, onEdit, onSave, onCancel, onClear, onDraft, error, checking,
                   roots, recent, browse, onBrowseCrumb, onBrowseEnter, onBrowsePick, onBrowseToggle, defaultCwd }) {
  if (editing) {
    const hint = checking ? 'checking…' : (error || null);
    const rootsRow = (roots && roots.length)
      ? h('div', { key: 'roots', class: 'agentchat-cwd-roots', role: 'group', 'aria-label': 'accessible folders' },
          ...roots.map((r, i) => h('button', {
            key: 'root' + i, type: 'button', class: 'agentchat-cwd-chip',
            onclick: () => onDraft && onDraft(r.path || r),
          }, r.label || r.path || r)))
      : null;
    const recentRow = (recent && recent.length)
      ? h('div', { key: 'recent', class: 'agentchat-cwd-recent', role: 'group', 'aria-label': 'recently used folders' },
          h('span', { key: 'rlbl', class: 'agentchat-cwd-recent-label' }, 'recent:'),
          ...recent.map((r, i) => h('button', {
            key: 'rec' + i, type: 'button', class: 'agentchat-cwd-chip',
            title: r, onclick: () => onDraft && onDraft(r),
          }, r.split(/[/\\]/).filter(Boolean).slice(-1)[0] || r)))
      : null;
    const browseToggle = onBrowseToggle
      ? h('button', { key: 'browsetoggle', type: 'button', class: 'agentchat-cwd-btn agentchat-cwd-browse-toggle',
          'aria-expanded': browse ? 'true' : 'false',
          onclick: () => onBrowseToggle() }, browse ? 'hide browser' : 'browse…')
      : null;
    const browsePanel = (browse && browse.entries)
      ? h('div', { key: 'browsepanel', class: 'agentchat-cwd-browse', role: 'group', 'aria-label': 'browse folders' },
          browse.segments ? BreadcrumbPath({ segments: browse.segments, root: browse.rootLabel || 'root', onNav: (i) => onBrowseCrumb && onBrowseCrumb(i) }) : null,
          h('div', { key: 'browselist', class: 'agentchat-cwd-browse-list', role: 'listbox', 'aria-label': 'subdirectories' },
            browse.loading
              ? h('div', { key: 'browseloading', class: 'agentchat-cwd-browse-loading', role: 'status' }, 'loading…')
              : (browse.entries.length
                  ? browse.entries.map((e, i) => h('button', {
                      key: 'be' + i, type: 'button', class: 'agentchat-cwd-browse-item', role: 'option',
                      onclick: () => onBrowseEnter && onBrowseEnter(e.path || e.name),
                    }, e.name || e.path))
                  : h('div', { key: 'browseempty', class: 'agentchat-cwd-browse-empty' }, 'no subfolders here'))),
          h('button', { key: 'browseuse', type: 'button', class: 'agentchat-cwd-btn', onclick: () => onBrowsePick && onBrowsePick(browse.current) }, 'use this folder'))
      : null;
    return h('div', { class: 'agentchat-cwd agentchat-cwd-editing', role: 'group', 'aria-label': 'Set working directory' },
      h('div', { key: 'row1', class: 'agentchat-cwd-row' },
        h('input', { class: 'agentchat-cwd-input', type: 'text', value: draft ?? cwd ?? '',
          placeholder: 'absolute path (blank = server default)',
          'aria-describedby': hint ? 'agentchat-cwd-hint' : null,
          'aria-invalid': error ? 'true' : null,
          'aria-busy': checking ? 'true' : null,
          oninput: (e) => onDraft && onDraft(e.target.value) }),
        browseToggle,
        Btn({ key: 'cancel', onClick: () => onCancel && onCancel(), children: 'cancel' }),
        Btn({ key: 'save', variant: 'primary', disabled: !!(error || checking), onClick: () => onSave && onSave(), children: 'save' })),
      rootsRow,
      recentRow,
      browsePanel,
      hint ? h('span', { key: 'hint', id: 'agentchat-cwd-hint', role: 'status', 'aria-live': 'polite',
        class: 'agentchat-cwd-hint' + (error ? ' is-error' : ' is-checking') }, hint) : null);
  }
  return h('div', { class: 'agentchat-cwd', role: 'group', 'aria-label': 'Working directory' },
    h('span', { class: 'agentchat-cwd-text', title: cwd || 'server default working directory' },
      'cwd: ' + (cwd || 'server default')),
    h('button', { type: 'button', class: 'agentchat-cwd-btn', onclick: () => onEdit && onEdit() }, cwd ? 'change' : 'set'),
    cwd ? h('button', { type: 'button', class: 'agentchat-cwd-btn',
        title: defaultCwd ? ('resets to: ' + defaultCwd) : 'reset to the server default working directory',
        onclick: () => onClear && onClear() }, 'use default') : null);
}
