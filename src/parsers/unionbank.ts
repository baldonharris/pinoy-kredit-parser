import { KreditTransaction } from '../types'

const regex =
  /^"?(\d{2}\/\d{2}\/\d{2})\s+(\d{2}\/\d{2}\/\d{2})\s+(.+?)\s+PHP\s+(-?[\d,]+\.\d{2})"?$/
export const parseUnionBank = (text: string): KreditTransaction[] =>
  text
    .split('\n')
    .map((line) => regex.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map(([, saleDate, postDate, description, amountStr]) => ({
      saleDate,
      postDate,
      description: description.trim(),
      amount: parseFloat(amountStr.replace(/,/g, '')),
    }))

const stmtRegex = /Statement Date\s*:\s*(\w{3} \d{2}, \d{4})/
const dueRegex = /Payment Due Date\s*:\s*(\w{3} \d{2}, \d{4})/

export const parseUnionBankMeta = (text: string): { statementDate: string; dueDate: string } => {
  const sm = stmtRegex.exec(text)
  const dm = dueRegex.exec(text)
  if (!sm || !dm) throw new Error('UnionBank: could not extract statement/due dates')
  return { statementDate: sm[1], dueDate: dm[1] }
}
