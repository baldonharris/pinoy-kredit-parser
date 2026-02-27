import { PDFParse } from 'pdf-parse'
import { BankType, KreditTransaction } from './types'
import { parseRCBC } from './parsers/rcbc'
import { parseMetrobank } from './parsers/metrobank'
import { parseUnionBank } from './parsers/unionbank'

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
