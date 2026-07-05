import { readFileSync } from 'node:fs'
import { CanvasFactory } from 'pdf-parse/worker'
import { baseParseKredit, baseParseMeta } from './core'
import { BankType } from './types'

export * from './types'

type NodeInput = string | Buffer | Uint8Array

export const parseKredit = async (input: NodeInput, options: { bank: BankType }) => {
  const buffer = typeof input === 'string' ? readFileSync(input) : input

  return baseParseKredit(buffer, { ...options, CanvasFactory })
}

export const parseKreditMeta = async (input: NodeInput, options: { bank: BankType }) => {
  const buffer = typeof input === 'string' ? readFileSync(input) : input

  return baseParseMeta(buffer, { ...options, CanvasFactory })
}
