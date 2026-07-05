# SPEC.md — pinoy-kredit-parser

> **Single source of truth** for features, architecture, and behavior.  
> Any change to functionality must be reflected here before code is written.

---

## 1. Overview

`pinoy-kredit-parser` is a lightweight, isomorphic TypeScript library that parses Philippine credit card statement PDFs into structured transaction data.

- **Package name:** `pinoy-kredit-parser`
- **Version:** `1.3.1`
- **License:** MIT
- **Registry:** npm
- **Repo:** https://github.com/baldonharris/pinoy-kredit-parser

### Design Goals

- Isomorphic: runs in both Node.js and browser environments without manual polyfills.
- Privacy-first: all parsing is local; no data leaves the user's machine.
- Minimal surface area: one function (`parseKredit`), one output type (`KreditTransaction`).
- Text-based PDFs only (scanned/image PDFs are not supported).

---

## 2. Supported Banks

| Enum Value            | String Key    | Parser File                       |
|-----------------------|---------------|-----------------------------------|
| `BankType.RCBC`       | `'rcbc'`      | `src/parsers/rcbc.ts`             |
| `BankType.METROBANK`  | `'metrobank'` | `src/parsers/metrobank.ts`        |
| `BankType.UNIONBANK`  | `'unionbank'` | `src/parsers/unionbank.ts`        |

Adding a new bank requires: a new enum value in `BankType`, a new parser file, a new `case` branch in `baseParseKredit`, and an update to this table.

---

## 3. Public API

### `parseKredit(input, options)`

Parses transactions from a credit card statement PDF.

```ts
parseKredit(input: NodeInput | BrowserInput, options: { bank: BankType }): Promise<KreditTransaction[]>
```

### `parseKreditMeta(input, options)`

Parses statement-level metadata (Statement Date and Due Date) from a credit card statement PDF. Exported from both `node.ts` and `browser.ts`.

```ts
parseKreditMeta(input: NodeInput | BrowserInput, options: { bank: BankType }): Promise<KreditMeta>
```

**Node input types** (`src/node.ts`):
- `string` — file path, read synchronously via `readFileSync`
- `Buffer`
- `Uint8Array`

**Browser input types** (`src/browser.ts`):
- `File`
- `Blob`
- `ArrayBuffer`
- `Uint8Array`

### `KreditTransaction`

```ts
type KreditTransaction = {
  saleDate: string      // MM/DD/YY  (RCBC, UnionBank) or MM/DD (Metrobank)
  postDate: string      // MM/DD/YY  (RCBC, UnionBank) or MM/DD (Metrobank)
  description: string   // Trimmed merchant/transaction name
  amount: number        // Positive = purchase/debit; Negative = payment/credit
}
```

> **Note:** Metrobank dates are `MM/DD` (no year) because that is how they appear in the raw PDF text.

### `KreditMeta`

```ts
type KreditMeta = {
  statementDate: string  // MM/DD/YYYY — normalized across all banks
  dueDate: string        // MM/DD/YYYY — normalized across all banks
}
```

Dates are normalized to `MM/DD/YYYY` regardless of how they appear in the raw PDF.

### `BankType`

```ts
enum BankType {
  RCBC       = 'rcbc',
  METROBANK  = 'metrobank',
  UNIONBANK  = 'unionbank',
}
```

Both `node.ts` and `browser.ts` re-export everything from `types.ts` so consumers import from the single package root.

---

## 4. Architecture

```
src/
├── types.ts          — KreditTransaction, BankType (shared)
├── core.ts           — baseParseKredit() — environment-agnostic orchestrator
├── node.ts           — Node.js entry point; accepts file paths & Buffers
├── browser.ts        — Browser entry point; accepts File/Blob/ArrayBuffer
└── parsers/
    ├── rcbc.ts       — RCBC statement parser
    ├── metrobank.ts  — Metrobank statement parser
    └── unionbank.ts  — UnionBank statement parser
```

### Data flow

```
User input
  └─ node.ts / browser.ts   (normalize input → Buffer / Uint8Array)
        └─ core.ts           (PDF text extraction via pdf-parse + CanvasFactory)
              └─ parsers/*   (regex-based line matching → KreditTransaction[])
```

### Environment split

| Concern                | Node (`node.ts`)                               | Browser (`browser.ts`)         |
|------------------------|------------------------------------------------|--------------------------------|
| Input normalization    | `string` → `readFileSync`; pass-through Buffer | `File`/`Blob` → `arrayBuffer()`|
| Canvas polyfill        | `CanvasFactory` from `pdf-parse/worker`        | None (browser has native Canvas)|
| `baseParseKredit` call | `{ ...options, CanvasFactory }`                | `{ ...options }` (no factory)  |

### Build outputs (`dist/`)

| File              | Consumer           | Description                        |
|-------------------|--------------------|------------------------------------|
| `dist/node.js`    | Node.js / Next.js  | CJS/ESM via NodeNext module        |
| `dist/browser.js` | Browser / Next.js client | Browser-safe bundle         |
| `dist/node.d.ts`  | TypeScript         | Type declarations for Node entry   |
| `dist/browser.d.ts`| TypeScript        | Type declarations for browser entry|

Package `exports` field in `package.json` routes consumers to the correct build automatically.

---

## 5. Parser Specifications

### 5.1 RCBC (`src/parsers/rcbc.ts`)

**Regex:** `^([\d,]+\.\d{2}-?)\t(\d{2}\/\d{2}\/\d{2}) (\d{2}\/\d{2}\/\d{2}) (.+)$`

**Column order in raw text:** `amount \t saleDate postDate description`

**Amount sign convention:**
- Trailing `-` in the amount string → negative (payment/credit)
- No trailing `-` → positive (purchase)

**Date format:** `MM/DD/YY`

**Meta pattern (raw text):**
```
JUL 28 2026\tJUL 05 2026
PAYMENT DUE DATE\tSTATEMENT DATE
```
Regex: `/([A-Z]{3} \d{2} \d{4})\t([A-Z]{3} \d{2} \d{4})\nPAYMENT DUE DATE\tSTATEMENT DATE/`
— Group 1 = dueDate, Group 2 = statementDate.

---

### 5.2 Metrobank (`src/parsers/metrobank.ts`)

**Regex:** `^"?(\d{2}\/\d{2})\s+(\d{2}\/\d{2})\s+(.+?)\s+([\d,]+\.\d{2}C?)"?$`

**Column order in raw text:** `saleDate postDate description amount`

**Amount sign convention:**
- Trailing `C` in the amount string → negative (credit)
- No trailing `C` → positive (debit)

**Date format:** `MM/DD` (no year — as extracted from Metrobank PDFs)

**Note:** Lines may be optionally wrapped in double-quotes.

**Meta pattern (raw text):**
```
Statement Date Payment Due Date
21 June 2026 13 July 2026
```
Regex: `/Statement Date Payment Due Date\n(\d{1,2} \w+ \d{4}) (\d{1,2} \w+ \d{4})/`
— Group 1 = statementDate, Group 2 = dueDate.

---

### 5.3 UnionBank (`src/parsers/unionbank.ts`)

**Regex:** `^"?(\d{2}\/\d{2}\/\d{2})\s+(\d{2}\/\d{2}\/\d{2})\s+(.+?)\s+PHP\s+(-?[\d,]+\.\d{2})"?$`

**Column order in raw text:** `saleDate postDate description PHP amount`

**Amount sign convention:**
- Leading `-` in the amount string → negative (credit/payment)
- No leading `-` → positive (purchase)

**Date format:** `MM/DD/YY`

**Note:** Amount is prefixed with `PHP` in the raw text. Lines may be optionally wrapped in double-quotes.

**Meta pattern (raw text, from STATEMENT SUMMARY section):**
```
Statement Date : Jun 08, 2026
Payment Due Date : Jun 25, 2026
```
Regexes: `/Statement Date\s*:\s*(\w{3} \d{2}, \d{4})/` and `/Payment Due Date\s*:\s*(\w{3} \d{2}, \d{4})/`

---

## 6. Dependencies

### Runtime

| Package            | Purpose                                              |
|--------------------|------------------------------------------------------|
| `pdf-parse`        | PDF text extraction; provides `PDFParse` and `CanvasFactory` |
| `@napi-rs/canvas`  | Native canvas bindings required by `pdf-parse` in Node.js |

### Dev

| Package                          | Purpose                  |
|----------------------------------|--------------------------|
| `typescript`                     | Compilation              |
| `ts-node`                        | Local script execution   |
| `prettier`                       | Code formatting          |
| `@typescript-eslint/*`           | Linting                  |
| `eslint-config-prettier`         | Lint/format conflict resolution |
| `@types/node`                    | Node.js type definitions |
| `vitest`                         | Test runner              |

---

## 7. Build & Tooling

| Command              | Effect                                               |
|----------------------|------------------------------------------------------|
| `npm run build`      | `rm -rf dist && tsc` — full clean rebuild            |
| `npm run format`     | Prettier format all `src/**/*.ts`                    |
| `npm run format:check` | Prettier check without writing                     |
| `npm test`           | Run integration tests with Vitest (once)             |
| `npm run test:watch` | Run Vitest in watch mode                             |
| `npm publish`        | Triggers `prepublishOnly` → `build` automatically    |

**TypeScript config highlights (`tsconfig.json`):**
- `target: ES2020`
- `module: NodeNext` / `moduleResolution: NodeNext`
- `strict: true`
- `declaration: true` (emits `.d.ts` files)
- `sourceMap: true`

---

## 8. Next.js Integration

Consumers using Next.js App Router must add the following to `next.config.ts` to avoid bundling native binaries:

```ts
const nextConfig = {
  experimental: {
    serverExternalPackages: ['pinoy-kredit-parser', 'pdf-parse', '@napi-rs/canvas'],
  },
};
```

---

## 9. Constraints & Limitations

- Text-based PDFs only — scanned/image PDFs are not supported.
- Credit card statements only — bank account or loan statements are out of scope.
- Parser regexes are tightly coupled to each bank's current PDF layout; layout changes by the bank may break parsing.
- Metrobank dates lack the year field.
- Integration test suite lives in `tests/integration.test.ts` and runs against PDF files in `sample/` (gitignored).

---

## 10. Known Gaps / Future Work

- No CI pipeline.
- Metrobank year is not captured (would require heuristics or user-provided statement date).
- Additional Philippine banks (BPI, BDO, Security Bank, etc.) are not yet supported.
