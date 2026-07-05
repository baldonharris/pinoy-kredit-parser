import { KreditTransaction } from '../types'

// Standard domestic line: AMOUNT\tSALE_DATE POST_DATE DESCRIPTION
const regex = /^([\d,]+\.\d{2}-?)\t(\d{2}\/\d{2}\/\d{2}) (\d{2}\/\d{2}\/\d{2}) (.+)$/
// Foreign-currency line: SALE_DATE POST_DATE DESCRIPTION AMOUNT (followed by FX_CODE AMOUNT on next line)
const fxRegex = /^(\d{2}\/\d{2}\/\d{2}) (\d{2}\/\d{2}\/\d{2}) (.+) ([\d,]+\.\d{2}-?)$/
const fxTrailingLine = /^[A-Z]{3} [\d,]+\.\d{2}$/

const toAmount = (amountStr: string): number => {
  const clean = parseFloat(amountStr.replace(/,/g, '').replace('-', ''))
  return amountStr.endsWith('-') ? -clean : clean
}

export const parseRCBC = (text: string): KreditTransaction[] => {
  const lines = text.split('\n')
  const results: KreditTransaction[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const m = regex.exec(line)
    if (m) {
      const [, amountStr, saleDate, postDate, description] = m
      results.push({
        saleDate,
        postDate,
        description: description.trim(),
        amount: toAmount(amountStr),
      })
      continue
    }

    const fx = fxRegex.exec(line)
    if (fx) {
      const [, saleDate, postDate, description, amountStr] = fx
      if (fxTrailingLine.test((lines[i + 1] ?? '').trim())) i++
      results.push({
        saleDate,
        postDate,
        description: description.trim(),
        amount: toAmount(amountStr),
      })
    }
  }

  return results
}

const metaRegex = /([A-Z]{3} \d{2} \d{4})\t([A-Z]{3} \d{2} \d{4})\nPAYMENT DUE DATE\tSTATEMENT DATE/

export const parseRCBCMeta = (text: string): { statementDate: string; dueDate: string } => {
  const m = metaRegex.exec(text)
  if (!m) throw new Error('RCBC: could not extract statement/due dates')
  return { dueDate: m[1], statementDate: m[2] }
}
