# pinoy-kredit-parser

A lightweight Node.js library for parsing Philippine credit card statement PDFs into structured transaction data.

Currently supports:

- RCBC
- Metrobank
- UnionBank

Built for automation, personal finance tools, and data analysis.

---

## Features

- Parse credit card statement PDFs
- Bank-specific parsers
- Structured transaction output
- Fast and dependency-light
- Tailored for Philippine formats

---

## Installation

```bash
npm install pinoy-kredit-parser
```

---

## How It Works

1. Extracts text from the PDF
2. Applies bank-specific parsing rules
3. Converts results into structured transactions

---

## Usage

```javascript
const { parseKredit, BankType } = require('pinoy-kredit-parser')

async function main() {
  const transactions = await parseKredit('statement.pdf', {
    bank: BankType.RCBC,
  })

  console.log(transactions)
}

main()
```

---

## Output Format

Each transaction is returned as:
```typescript
type KreditTransaction = {
  saleDate: string
  postDate: string
  description: string
  amount: number
}
```
Example:
```json
[
  {
    "saleDate": "01/15/25",
    "postDate": "01/16/25",
    "description": "MERCHANT NAME",
    "amount": 1250.5
  }
]
```

---

## Supported Banks

Specify the bank using `BankType`:
```javascript
BankType.RCBC
BankType.METROBANK
BankType.UNIONBANK
```

---

## Limitations

- Designed for credit card statements only
- Requires text-based PDFs (not scanned images)
- Changes in bank statement layouts may break parsing
- Currently supports selected Philippine banks only

---

## Contributing

Contributions are welcome! Especially for adding support for more Philippine banks.
If a parser breaks due to layout fixes, feel free to submit fixes.