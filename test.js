const { parseKredit, BankType } = require('./dist/index')

async function main() {
  const transactions = await parseKredit('statement.pdf', {
    bank: BankType.METROBANK,
  })

  console.log(transactions)
}

main()
