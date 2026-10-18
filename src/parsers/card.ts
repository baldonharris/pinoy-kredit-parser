// Match an entire displayed identifier; never return the full number.
const numberPattern =
  '(?:[\\d*xX•]{4}(?:[ \\t-]*[\\d*xX•]{4}){2}[ \\t-]*\\d{4}|[*xX•]{4,12}[ \\t-]*\\d{4}|\\d{4})'

export const extractCardLastFour = (
  text: string,
  label: string,
  numberBeforeLabel = false,
): string | null => {
  const patterns = [
    new RegExp(`${label}[ \\t]*:?[\\s]*(${numberPattern})(?![\\d*xX•-]|[ \\t]+[\\d*xX•])`, 'gi'),
  ]
  if (numberBeforeLabel) {
    patterns.push(
      new RegExp(
        `^[ \\t]*(${numberPattern})[ \\t]*\\r?\\n(?:[^\\r\\n\\d]+\\r?\\n)?[ \\t]*${label}\\b`,
        'gim',
      ),
    )
  }
  const endings = new Set<string>()
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) endings.add(match[1].slice(-4))
  }
  return endings.size === 1 ? [...endings][0] : null
}
