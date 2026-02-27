import { PDFParse } from 'pdf-parse'
import { BankType, KreditTransaction } from './types'
import { parseRCBC } from './parsers/rcbc'
import { parseMetrobank } from './parsers/metrobank'
import { parseUnionBank } from './parsers/unionbank'
import { readFileSync } from 'node:fs'

type Input = File | string
type ParseKredit = (file: Input, options: { bank: BankType }) => Promise<KreditTransaction[]>
export const parseKredit: ParseKredit = async (input, options) => {
  let buffer: Buffer

  if (typeof input === 'string') {
    buffer = readFileSync(input)
  } else {
    const arrayBuffer = await input.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  }

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
