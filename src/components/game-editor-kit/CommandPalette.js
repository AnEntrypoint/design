// Command palette: fuzzy keyboard-first palette for editor commands (spawn entity, toggle panels,
// run validators, switch modes). Uses the host's existing window-manager shell (wm.open/close/getWindow).
// Migrated from spoint's client/editor/CommandPalette.js per the GUI-lives-in-design-kit architecture
// rule -- the command registry (labels/keywords/action ids) is passed in by the host via `commands`
// rather than hardcoded here, since it names spoint-specific editor actions this generic component has
// no reason to know about.

export function createCommandPalette({ wm, commands = [], onExecute }) {
  let _inputEl = null, _resultsEl = null, _highlight = -1, _results = [], _query = ''
  const winId = 'command-palette'
  const container = document.createElement('div')
  container.style.cssText = 'display:flex;flex-direction:column;height:100%;padding:8px;font:12px var(--ff-mono,monospace)'

  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Type a command...'
  input.style.cssText = 'width:100%;box-sizing:border-box;padding:6px 8px;background:var(--panel-2,#1a1a1a);color:var(--panel-text,#eee);border:1px solid var(--rule,#444);border-radius:4px;font:inherit;outline:none'
  input.addEventListener('input', () => { _query = input.value; _filter(); _render() })
  input.addEventListener('keydown', _onKey)
  _inputEl = input

  const results = document.createElement('div')
  results.style.cssText = 'flex:1;overflow-y:auto;margin-top:6px'
  _resultsEl = results

  container.appendChild(input)
  container.appendChild(results)

  function _fuzzyScore(query, text) {
    const q = query.toLowerCase()
    const t = text.toLowerCase()
    let qi = 0, score = 0
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        // Bonus for consecutive matches and word-start matches
        score += 1 + (ti === 0 || t[ti - 1] === ' ' ? 2 : 0) + (qi > 0 && ti > 0 && t[ti - 1] === q[qi - 1] ? 3 : 0)
        qi++
      }
    }
    return qi === q.length ? score / t.length : 0
  }

  function _filter() {
    const q = _query.trim()
    if (!q) { _results = []; _highlight = -1; return }
    const scored = commands.map(c => ({
      cmd: c,
      score: _fuzzyScore(q, c.label) * 2 + _fuzzyScore(q, (c.keywords || ''))
    }))
    scored.sort((a, b) => b.score - a.score)
    _results = scored.filter(s => s.score > 0).slice(0, 20)
    _highlight = _results.length > 0 ? 0 : -1
  }

  function _render() {
    _resultsEl.innerHTML = ''
    _results.forEach((r, i) => {
      const row = document.createElement('div')
      row.style.cssText = `padding:6px 8px;cursor:pointer;border-radius:4px;display:flex;align-items:center;gap:8px;${i === _highlight ? 'background:var(--accent-2,rgba(100,120,255,0.25))' : ''}`
      row.setAttribute('data-cmd-id', r.cmd.id)
      const label = document.createElement('span')
      label.textContent = r.cmd.label
      label.style.flex = '1'
      const hint = document.createElement('span')
      hint.textContent = r.cmd.keywords ? r.cmd.keywords.split(' ').slice(0, 2).join(' ') : ''
      hint.style.cssText = 'font-size:10px;color:var(--panel-text-3,var(--fg-3))'
      row.appendChild(label)
      row.appendChild(hint)
      row.addEventListener('click', () => { _execute(r.cmd) })
      row.addEventListener('mouseenter', () => { _highlight = i; _render() })
      _resultsEl.appendChild(row)
    })
    if (_results.length === 0 && _query.trim()) {
      const empty = document.createElement('div')
      empty.textContent = 'No matching commands'
      empty.style.cssText = 'padding:12px;text-align:center;color:var(--panel-text-3,var(--fg-3))'
      _resultsEl.appendChild(empty)
    }
  }

  function _execute(cmd) {
    close()
    if (cmd.action) cmd.action()
    else onExecute?.(cmd.id)
  }

  function _onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); _highlight = Math.min(_highlight + 1, _results.length - 1); _render() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); _highlight = Math.max(_highlight - 1, 0); _render() }
    else if (e.key === 'Enter') { e.preventDefault(); if (_results[_highlight]) _execute(_results[_highlight].cmd) }
    else if (e.key === 'Escape') { e.preventDefault(); close() }
  }

  function open(freshCommands) {
    if (Array.isArray(freshCommands)) commands = freshCommands
    _query = ''; _highlight = -1; _results = []
    if (_inputEl) _inputEl.value = ''
    _render()
    const bounds = { x: (window.innerWidth - 420) / 2, y: (window.innerHeight - 320) / 2, w: 420, h: 320 }
    const handle = wm.open({ id: winId, title: 'Command Palette', ...bounds, body: container })
    // Focus input after a tick so the window has rendered
    setTimeout(() => { if (_inputEl && _inputEl.isConnected) _inputEl.focus() }, 50)
    return handle
  }

  function close() {
    wm.close(winId)
  }

  function toggle(freshCommands) {
    if (wm.getWindow(winId)) { close() } else { open(freshCommands) }
  }

  return { open, close, toggle, get input() { return _inputEl }, get results() { return _results } }
}
