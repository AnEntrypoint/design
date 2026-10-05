export function getFilteredAssets(s) {
  s.renderStart = performance.now()
  let result = s.assets

  if (s.currentFolder) {
    result = result.filter(a => a.folder === s.currentFolder)
  }

  if (s.searchQuery) {
    const q = s.searchQuery.toLowerCase()
    result = result.filter(a => a.name.toLowerCase().includes(q))
  }

  if (s.selectedTags.size > 0) {
    result = result.filter(a => a.tags && a.tags.some(t => s.selectedTags.has(t)))
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
}

export function getAllTags(s) {
  const tags = new Set()
  for (const asset of s.assets) {
    if (asset.tags) asset.tags.forEach(t => tags.add(t))
  }
  return Array.from(tags).sort()
}
