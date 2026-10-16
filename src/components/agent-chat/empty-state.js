import * as webjsx from '../../../vendor/webjsx/index.js';
import { Btn } from '../shell.js';
import { attempt } from '../../best-effort.js';

const h = webjsx.createElement;

export function AgentEmptyState({ name, selectedAgent, suggestions, onSuggestionClick, installHint }) {
  return h('div', { class: 'agentchat-empty', role: 'status' },
    h('p', { class: 'agentchat-empty-title' }, (selectedAgent || name) ? (selectedAgent || name) + ' is ready.' : 'Select an agent to start.'),
    h('p', { class: 'agentchat-empty-sub' },
      (selectedAgent || name) ? 'Type a message below.' : 'Pick an agent from the selector above, then send a message.'),
    (suggestions && suggestions.length)
      ? h('div', { class: 'agentchat-empty-suggestions' },
          ...suggestions.map((s, i) => h('button', {
            key: 'sug' + i, type: 'button', class: 'agentchat-empty-suggestion',
            onclick: () => { const t = typeof s === 'string' ? s : (s.prompt || s.text || ''); if (onSuggestionClick) onSuggestionClick(t); },
          }, typeof s === 'string' ? s : (s.label || s.text || s.prompt))))
      : null,
    installHint
      ? h('div', { class: 'agentchat-install', role: 'group', 'aria-label': 'install an agent' },
          installHint.text ? h('p', { class: 'agentchat-install-text' }, installHint.text) : null,
          (installHint.commands && installHint.commands.length)
            ? h('ul', { class: 'agentchat-install-list' },
                ...installHint.commands.map((c, i) => h('li', { key: 'inst' + i, class: 'agentchat-install-row' },
                  h('span', { class: 'agentchat-install-agent' }, c.agent),
                  h('code', { class: 'agentchat-install-cmd' }, c.command),
                  h('button', {
                    type: 'button', class: 'agentchat-install-copy',
                    'aria-label': 'copy install command for ' + c.agent, title: 'copy command',
                    onclick: (e) => {
                      const btn = e.currentTarget;
                      const done = () => { btn.textContent = 'copied'; setTimeout(() => { btn.textContent = 'copy'; }, 1200); };
                      const fallback = () => { attempt(() => { const t = document.createElement('textarea'); t.value = c.command; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); done(); }); };
                      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(c.command).then(done, fallback);
                      else fallback();
                    },
                  }, 'copy'))))
            : null,
          installHint.onRecheck
            ? h('div', { class: 'agentchat-install-actions' },
                Btn({ onClick: () => installHint.onRecheck(), children: 'recheck agents', title: 'Re-check installed agents' }))
            : null)
      : null);
}

export function FollowupRow({ followups, onFollowupClick, onSuggestionClick }) {
  return h('div', { class: 'agentchat-followups', role: 'group', 'aria-label': 'suggested follow-ups' },
    ...followups.map((s, i) => h('button', {
      key: 'fu' + i, type: 'button', class: 'agentchat-empty-suggestion agentchat-followup',
      onclick: () => { const t = typeof s === 'string' ? s : (s.prompt || s.text || ''); if (onFollowupClick) onFollowupClick(t); else if (onSuggestionClick) onSuggestionClick(t); },
    }, typeof s === 'string' ? s : (s.label || s.text || s.prompt))));
}
