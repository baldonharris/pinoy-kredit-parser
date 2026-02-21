import { KreditTransaction } from 'src/types'

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
