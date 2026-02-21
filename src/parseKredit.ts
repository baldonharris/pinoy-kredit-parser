import { PDFParse } from 'pdf-parse'
import { readFileSync } from 'fs'
import { BankType, KreditTransaction } from 'src/types'
import { parseRCBC } from 'src/parsers/rcbc'
import { parseMetrobank } from 'src/parsers/metrobank'
import { parseUnionBank } from 'src/parsers/unionbank'

type ParseKredit = (
  pdfFilePath: string,
  options: { bank: BankType },
) => Promise<KreditTransaction[]>
export const parseKredit: ParseKredit = async (pdfFilePath, options) => {
  const buffer = readFileSync(pdfFilePath)

  const parser = new PDFParse({ data: buffer })
  const textResult = await parser.getText()

  const text = textResult.text

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
