import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { parseKredit, parseKreditMeta, BankType } from '../src/node'
import { PDFParse, CanvasFactory } from 'pdf-parse'

const sampleDir = join(__dirname, '../sample')

async function extractText(pdfPath: string): Promise<string> {
  const buf = readFileSync(pdfPath)
  const parser = new PDFParse({ data: buf, CanvasFactory })
  const { text } = await parser.getText()
  return text
}

describe('RCBC', () => {
  const pdf = join(sampleDir, 'RCBC.pdf')

  // Standard domestic: AMOUNT\tSALE_DATE POST_DATE DESCRIPTION
  const stdRegex = /^([\d,]+\.\d{2}-?)\t(\d{2}\/\d{2}\/\d{2}) (\d{2}\/\d{2}\/\d{2}) (.+)$/gm
  // Foreign currency: SALE_DATE POST_DATE DESCRIPTION AMOUNT
  const fxRegex = /^(\d{2}\/\d{2}\/\d{2}) (\d{2}\/\d{2}\/\d{2}) (.+) ([\d,]+\.\d{2}-?)$/gm

  it('parses all transactions visible in raw PDF text', async () => {
    const [text, txns] = await Promise.all([extractText(pdf), parseKredit(pdf, { bank: BankType.RCBC })])

    const rawStd = [...text.matchAll(stdRegex)]
    const rawFx = [...text.matchAll(fxRegex)]
    const rawTotal = rawStd.length + rawFx.length

    expect(txns.length).toBe(rawTotal)
  })

  it('captures foreign-currency transactions', async () => {
    const txns = await parseKredit(pdf, { bank: BankType.RCBC })

    const anthropic = txns.find((t) => t.description.includes('ANTHROPIC'))
    expect(anthropic).toBeDefined()
    expect(anthropic?.saleDate).toBe('06/25/26')
    expect(anthropic?.postDate).toBe('06/25/26')
    expect(anthropic?.amount).toBe(1429.29)
  })

  it('parses transactions with correct format', async () => {
    const txns = await parseKredit(pdf, { bank: BankType.RCBC })
    expect(txns.length).toBeGreaterThan(0)
    for (const t of txns) {
      expect(t.saleDate).toMatch(/^\d{2}\/\d{2}\/\d{2}$/)
      expect(t.postDate).toMatch(/^\d{2}\/\d{2}\/\d{2}$/)
      expect(typeof t.description).toBe('string')
      expect(t.description.trim().length).toBeGreaterThan(0)
      expect(Number.isFinite(t.amount)).toBe(true)
    }
  })

  it('parses meta', async () => {
    const meta = await parseKreditMeta(pdf, { bank: BankType.RCBC })
    expect(meta.statementDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    expect(meta.dueDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})

describe('Metrobank', () => {
  const pdf = join(sampleDir, 'Metrobank.pdf')

  const rawRegex = /^"?(\d{2}\/\d{2})\s+(\d{2}\/\d{2})\s+(.+?)\s+([\d,]+\.\d{2}C?)"?$/gm

  it('parses all transactions visible in raw PDF text', async () => {
    const [text, txns] = await Promise.all([extractText(pdf), parseKredit(pdf, { bank: BankType.METROBANK })])

    const rawTotal = [...text.matchAll(rawRegex)].length
    expect(txns.length).toBe(rawTotal)
  })

  it('parses transactions with correct format', async () => {
    const txns = await parseKredit(pdf, { bank: BankType.METROBANK })
    expect(txns.length).toBeGreaterThan(0)
    for (const t of txns) {
      expect(t.saleDate).toMatch(/^\d{2}\/\d{2}$/)
      expect(t.postDate).toMatch(/^\d{2}\/\d{2}$/)
      expect(typeof t.description).toBe('string')
      expect(t.description.trim().length).toBeGreaterThan(0)
      expect(Number.isFinite(t.amount)).toBe(true)
    }
  })

  it('parses meta', async () => {
    const meta = await parseKreditMeta(pdf, { bank: BankType.METROBANK })
    expect(meta.statementDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    expect(meta.dueDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})

describe('UnionBank', () => {
  const pdf = join(sampleDir, 'Unionbank.pdf')

  const rawRegex = /^"?(\d{2}\/\d{2}\/\d{2})\s+(\d{2}\/\d{2}\/\d{2})\s+(.+?)\s+PHP\s+(-?[\d,]+\.\d{2})"?$/gm

  it('parses all transactions visible in raw PDF text', async () => {
    const [text, txns] = await Promise.all([extractText(pdf), parseKredit(pdf, { bank: BankType.UNIONBANK })])

    const rawTotal = [...text.matchAll(rawRegex)].length
    expect(txns.length).toBe(rawTotal)
  })

  it('parses transactions with correct format', async () => {
    const txns = await parseKredit(pdf, { bank: BankType.UNIONBANK })
    expect(txns.length).toBeGreaterThan(0)
    for (const t of txns) {
      expect(t.saleDate).toMatch(/^\d{2}\/\d{2}\/\d{2}$/)
      expect(t.postDate).toMatch(/^\d{2}\/\d{2}\/\d{2}$/)
      expect(typeof t.description).toBe('string')
      expect(t.description.trim().length).toBeGreaterThan(0)
      expect(Number.isFinite(t.amount)).toBe(true)
    }
  })

  it('parses meta', async () => {
    const meta = await parseKreditMeta(pdf, { bank: BankType.UNIONBANK })
    expect(meta.statementDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    expect(meta.dueDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})
