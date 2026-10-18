import { describe, expect, it } from 'vitest'
import { parseRCBCMeta } from '../src/parsers/rcbc'
import { parseMetrobankMeta } from '../src/parsers/metrobank'
import { parseUnionBankMeta } from '../src/parsers/unionbank'

const banks = [
  {
    name: 'RCBC',
    parse: parseRCBCMeta,
    dates: 'JUL 28 2026\tJUL 05 2026\nPAYMENT DUE DATE\tSTATEMENT DATE',
    label: 'CARD NUMBER',
  },
  {
    name: 'Metrobank',
    parse: parseMetrobankMeta,
    dates: 'Statement Date Payment Due Date\n21 June 2026 13 July 2026',
    label: 'CREDIT CARD ACCOUNT',
  },
  {
    name: 'UnionBank',
    parse: parseUnionBankMeta,
    dates: 'Statement Date : Jun 08, 2026\nPayment Due Date : Jun 25, 2026',
    label: 'CARD NO.',
  },
]

for (const { name, parse, dates, label } of banks) {
  describe(`${name} card metadata`, () => {
    it.each([
      '1234-5678-9012-0007',
      '1234 5678 9012 0007',
      '1234567890120007',
      '1234-56**-****-0007',
      '**** **** **** 0007',
      'XXXXXXXXXXXX0007',
      '****0007',
      '0007',
    ])('extracts only the last four from %s', (number) => {
      const result = parse(`${dates}\n${label}:\n${number}\nPage 3 of 5`)
      expect(result.cardLastFour).toBe('0007')
      expect(Object.keys(result).sort()).toEqual(['cardLastFour', 'dueDate', 'statementDate'])
      if (number.length > 4) expect(JSON.stringify(result)).not.toContain(number)
    })

    it('accepts repeated headers with the same ending', () => {
      expect(parse(`${dates}\n${label} 1234-5678-9012-0007\n${label} ****0007`).cardLastFour).toBe(
        '0007',
      )
    })

    it('returns null for distinct card endings', () => {
      expect(parse(`${dates}\n${label} ****0007\n${label} ****0008`).cardLastFour).toBeNull()
    })

    it.each([
      '',
      'ACCOUNT NUMBER 1234-5678-9012-0007',
      `${label} 1234-5678-9012-007`,
      `${label} ****-****`,
    ])('keeps dates when the card number is missing or malformed: %s', (card) => {
      const result = parse(`${dates}\n${card}`)
      expect(result.cardLastFour).toBeNull()
      expect(result.statementDate).toBeTruthy()
      expect(result.dueDate).toBeTruthy()
    })
  })
}

it('handles the RCBC number/product/label extraction order', () => {
  const dates = banks[0].dates
  expect(parseRCBCMeta(`1234-5678-9012-0007\nFLEX VISA\nCARD NUMBER\n${dates}`).cardLastFour).toBe(
    '0007',
  )
})
