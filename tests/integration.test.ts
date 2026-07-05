import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { parseKredit, parseKreditMeta, BankType } from '../src/node'

const sampleDir = join(__dirname, '../sample')

describe('RCBC', () => {
  const pdf = join(sampleDir, 'RCBC.pdf')

  it('parses transactions', async () => {
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

  it('parses transactions', async () => {
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

  it('parses transactions', async () => {
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
