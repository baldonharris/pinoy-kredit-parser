import { baseParseKredit } from './core'
import { BankType } from './types'

export * from './types'

type BrowserInput = File | Blob | ArrayBuffer | Uint8Array

export const parseKredit = async (input: BrowserInput, options: { bank: BankType }) => {
  const data = input instanceof File || input instanceof Blob ? await input.arrayBuffer() : input

  return baseParseKredit(new Uint8Array(data), options)
}
