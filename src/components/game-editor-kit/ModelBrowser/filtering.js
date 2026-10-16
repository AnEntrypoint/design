export function filteredAndSorted(s) {
  let list = s.models.slice()
  const q = (s.search || '').toLowerCase()
  if (q) {
    list = list.filter(m =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.path || '').toLowerCase().includes(q) ||
      (m.tags || []).some(t => t.toLowerCase().includes(q))
    )
  }
  if (s.filterCategory !== 'all' && s.filterCategory) {
    list = list.filter(m => (m.category || '').toLowerCase() === s.filterCategory.toLowerCase())
  }
  if (s.filterMaterial !== 'all' && s.filterMaterial) {
    list = list.filter(m => (m.materialType || '').toLowerCase() === s.filterMaterial.toLowerCase())
  }
  if (s.filterScale !== 'all' && s.filterScale) {
    list = list.filter(m => (m.scale || '').toLowerCase() === s.filterScale.toLowerCase())
  }
  const sortFn = {
    'name': (a, b) => (a.name || '').localeCompare(b.name || ''),
    'size': (a, b) => (b.fileSize || 0) - (a.fileSize || 0),
    'date': (a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0),
    'usage': (a, b) => (b.usageCount || 0) - (a.usageCount || 0)
  }[s.sortBy] || ((a, b) => (a.name || '').localeCompare(b.name || ''))
  return list.sort(sortFn)
}
