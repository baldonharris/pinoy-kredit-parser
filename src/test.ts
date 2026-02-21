import { parseKredit } from './parseKredit'
import { BankType } from './types'

;(async () => {
  const pdfPath = './statements/rcbc.pdf'
  const transactions = await parseKredit(pdfPath, { bank: BankType.RCBC })
  console.log(transactions)
})()
