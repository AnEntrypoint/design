
export function extractAtQuery(textBeforeCursor) {
    const quoted = /(?:^|\s)@"([^"\n]*)$/.exec(textBeforeCursor)
    if (quoted) {
        return { start: textBeforeCursor.length - (quoted[1].length + 2), query: quoted[1], quoted: true }
    }
    const plain = /(?:^|\s)@([^\s"]*)$/.exec(textBeforeCursor)
    if (plain) {
        return { start: textBeforeCursor.length - (plain[1].length + 1), query: plain[1], quoted: false }
    }
    return null
}

function pathDepth(p) {
    let depth = 0
    for (let i = 0; i < p.length; i++) if (p[i] === '/') depth++
    return depth
}

export function buildEntriesFromFiles(files) {
    const dirs = new Set()
    for (const f of files) {
        let idx = f.indexOf('/')
        while (idx !== -1) {
            dirs.add(f.slice(0, idx))
            idx = f.indexOf('/', idx + 1)
        }
    }
    const entries = []
    for (const d of dirs) entries.push({ path: d, isDir: true })
    for (const f of files) {
        if (!f) continue
        entries.push({ path: f, isDir: false })
    }
    entries.sort((a, b) => pathDepth(a.path) - pathDepth(b.path) || a.path.localeCompare(b.path))
    return entries
}

function isSubsequence(needle, haystack) {
    if (!needle) return true
    let i = 0
    for (let j = 0; j < haystack.length && i < needle.length; j++) {
        if (haystack[j] === needle[i]) i++
    }
    return i === needle.length
}

function scoreEntry(entry, lowerQuery) {
    const lowerPath = entry.path.toLowerCase()
    let score = 0
    if (lowerQuery.includes('/')) {
        if (lowerPath === lowerQuery) score = 100
        else if (lowerPath.startsWith(lowerQuery)) score = 80
        else if (lowerPath.includes(lowerQuery)) score = 50
        else if (isSubsequence(lowerQuery, lowerPath)) score = 10
    } else {
        const slash = lowerPath.lastIndexOf('/')
        const lowerName = slash === -1 ? lowerPath : lowerPath.slice(slash + 1)
        if (lowerName === lowerQuery) score = 100
        else if (lowerName.startsWith(lowerQuery)) score = 80
        else if (lowerName.includes(lowerQuery)) score = 50
        else if (lowerPath.includes(lowerQuery)) score = 30
        else if (isSubsequence(lowerQuery, lowerPath)) score = 10
    }
    if (entry.isDir && score > 0) score += 10
    return score
}

export const AT_RESULT_LIMIT = 20

export function filterFileEntries(entries, query, limit = AT_RESULT_LIMIT) {
    const lowerQuery = query.toLowerCase()
    if (!lowerQuery) return entries.slice(0, limit)
    const scored = []
    for (const entry of entries) {
        const score = scoreEntry(entry, lowerQuery)
        if (score > 0) scored.push({ entry, score })
    }
    scored.sort((a, b) => b.score - a.score || pathDepth(a.entry.path) - pathDepth(b.entry.path) || a.entry.path.localeCompare(b.entry.path))
    return scored.slice(0, limit).map(s => s.entry)
}

export function buildAtInsertText(entryPath, isDir, forceQuotes = false) {
    const p = isDir ? `${entryPath}/` : entryPath
    const needsQuotes = forceQuotes || p.includes(' ')
    if (isDir) {
        const text = needsQuotes ? `@"${p}"` : `@${p}`
        return { text, cursorOffset: needsQuotes ? text.length - 1 : text.length }
    }
    const text = needsQuotes ? `@"${p}" ` : `@${p} `
    return { text, cursorOffset: text.length }
}

export function buildAtMentionText(entryPath, isDir) {
    const p = isDir ? `${entryPath}/` : entryPath
    return p.includes(' ') ? `@"${p}" ` : `@${p} `
}

export function buildFileAtMentionsText(entryPaths) {
    return entryPaths.map(entryPath => buildAtMentionText(entryPath, false)).join('')
}
