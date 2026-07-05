import { PDFParse } from 'pdf-parse'
import { BankType, KreditMeta, KreditTransaction } from './types'
import { parseRCBC, parseRCBCMeta } from './parsers/rcbc'
import { parseMetrobank, parseMetrobankMeta } from './parsers/metrobank'
import { parseUnionBank, parseUnionBankMeta } from './parsers/unionbank'

export const baseParseKredit = async (
  data: Buffer | Uint8Array,
  options: { bank: BankType; CanvasFactory?: any },
): Promise<KreditTransaction[]> => {
  const parser = new PDFParse({
    data: Buffer.from(data),
    CanvasFactory: options.CanvasFactory,
  })

  const { text } = await parser.getText()

  switch (options.bank) {
    case BankType.RCBC:
      return parseRCBC(text)
    case BankType.METROBANK:
      return parseMetrobank(text)
    case BankType.UNIONBANK:
      return parseUnionBank(text)
    default:
      throw new Error('Unsupported bank type')
  }
}

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
}

const normalizeMetaDate = (raw: string): string => {
  const parts = raw.replace(',', '').trim().split(/\s+/)
  let day: string, month: string, year: string
  if (/^\d+$/.test(parts[0])) {
    // DD Month YYYY (Metrobank)
    ;[day, month, year] = parts
  } else {
    // MMM DD YYYY (RCBC / UnionBank)
    ;[month, day, year] = parts
  }
  const mm = MONTH_MAP[month.toLowerCase()]
  if (!mm) throw new Error(`Unknown month in date: ${raw}`)
  return `${mm}/${day.padStart(2, '0')}/${year}`
}

export const baseParseMeta = async (
  data: Buffer | Uint8Array,
  options: { bank: BankType; CanvasFactory?: any },
): Promise<KreditMeta> => {
  const parser = new PDFParse({
    data: Buffer.from(data),
    CanvasFactory: options.CanvasFactory,
  })

  const { text } = await parser.getText()

  let raw: { statementDate: string; dueDate: string }
  switch (options.bank) {
    case BankType.RCBC:
      raw = parseRCBCMeta(text)
      break
    case BankType.METROBANK:
      raw = parseMetrobankMeta(text)
      break
    case BankType.UNIONBANK:
      raw = parseUnionBankMeta(text)
      break
    default:
      throw new Error('Unsupported bank type')
  }

  return {
    statementDate: normalizeMetaDate(raw.statementDate),
    dueDate: normalizeMetaDate(raw.dueDate),
  }
}
