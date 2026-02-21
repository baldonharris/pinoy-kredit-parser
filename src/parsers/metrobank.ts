import { KreditTransaction } from '../types'

export function parseMetrobank(text: string): KreditTransaction[] {
  const regex = /^"?(\d{2}\/\d{2})\s+(\d{2}\/\d{2})\s+(.+?)\s+([\d,]+\.\d{2}C?)"?$/

  return text
    .split('\n')
    .map((line) => regex.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map(([, saleDate, postDate, description, amountStr]) => {
      const isCredit = amountStr.endsWith('C')

      const clean = parseFloat(amountStr.replace(/,/g, '').replace('C', ''))

      return {
        saleDate,
        postDate,
        description: description.trim(),
        amount: isCredit ? -clean : clean,
      }
    })
}
