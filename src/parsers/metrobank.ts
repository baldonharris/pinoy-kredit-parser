import { KreditTransaction } from '../types'

const regex = /^"?(\d{2}\/\d{2})\s+(\d{2}\/\d{2})\s+(.+?)\s+([\d,]+\.\d{2}C?)"?$/
export const parseMetrobank = (text: string): KreditTransaction[] =>
  text
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

const metaRegex = /Statement Date Payment Due Date\n(\d{1,2} \w+ \d{4}) (\d{1,2} \w+ \d{4})/

export const parseMetrobankMeta = (text: string): { statementDate: string; dueDate: string } => {
  const m = metaRegex.exec(text)
  if (!m) throw new Error('Metrobank: could not extract statement/due dates')
  return { statementDate: m[1], dueDate: m[2] }
}
