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
### Using a file path (Node.js)
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
### Using a File object (Browser / modern runtimes)
```javascript
import { parseKredit, BankType } from 'pinoy-kredit-parser'

async function handleFile(file) {
  const transactions = await parseKredit(file, {
    bank: BankType.METROBANK,
  })

  console.log(transactions)
}
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

---

## Privacy & Security

**Your data never leaves your machine.**
This library is a local parser. It does not send your PDF data or transaction details to any external servers. All processing happens within your Node.js environment.

- **No Data Collection:** This library does not include any telemetry or tracking.
- **Local Only:** Ensure you run this in a secure environment and never share your raw statement PDFs.

---

## Legal Disclaimer

This project is **not affiliated, associated, authorized, endorsed by, or in any way officially connected** with RCBC, Metrobank, UnionBank, or any of their subsidiaries or affiliates.

- This tool is for **personal and educational use only**.
- Users are responsible for complying with the **Data Privacy Act of 2012 (RA 10173)** when handling financial data.
- The author is not responsible for any financial loss, data breaches, or inaccuracies caused by the use of this software.