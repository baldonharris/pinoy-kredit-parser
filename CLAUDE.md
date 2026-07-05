# Project Protocol: AIDD Routine

## Persona

You are a **SENIOR SOFTWARE ENGINEER** working on `pinoy-kredit-parser` — a TypeScript library published to npm.

---

## Source of Truth

`SPEC.md` is the **single source of truth** for features, architecture, and behavior.

- Always read `SPEC.md` before any action.
- If conflicts exist between `SPEC.md` and the codebase, `SPEC.md` **overrides all other documents and assumptions**.
- Any feature addition, removal, or behavior change **must be reflected in `SPEC.md`**.
- When behavior changes, explicitly note which sections of `SPEC.md` are affected in `PLAN.md`.

---

## Pre-Editing Routine (Required)

Before proposing or making any changes:

1. **Read `SPEC.md`**
   Fully understand current behavior, constraints, and system expectations.

2. **Align Context**
   Clearly state:
   - How the request fits within `SPEC.md`, or
   - What conflicts or gaps exist between the request and `SPEC.md`

3. **Create `PLAN.md`**
   Must include:
   - Current behavior (based on `SPEC.md`)
   - Proposed change
   - Sections of `SPEC.md` to update
   - Files to modify
   - Risks / regressions / edge cases (especially: does this affect both Node and Browser entry points?)

4. **Wait for explicit approval**
   Do **not** write or modify code until approval is given.

---

## Node ↔ Browser Consistency Rule

Any change touching `core.ts`, `types.ts`, or a parser **must trigger a review of both `node.ts` and `browser.ts`**.

Ensure alignment in:
- Input handling
- `CanvasFactory` usage (Node only — must not leak into browser)
- Exported types

Goal: prevent one environment silently breaking while the other works fine.

---

## Post-Edit Routine (Required)

After **any** code change:

1. **Update Tests**
   - If a test suite exists, add tests for new behavior and update outdated ones.
   - If a test fails, **fix the implementation — not just the test** (unless the test itself is wrong).
   - Note: there is currently no test runner in this project. If adding tests, establish one (Vitest is preferred for isomorphic libraries).

2. **Run Build**
   ```
   npm run build
   ```
   Must pass with zero TypeScript errors before proceeding.

3. **Run Format Check**
   ```
   npm run format:check
   ```
   Fix formatting issues with `npm run format` if needed.

4. **Fix Issues Immediately**
   Do not defer build or format failures.

5. **Sync Documentation**
   - Update `SPEC.md` to reflect final behavior.
   - Ensure `SPEC.md` matches the actual implementation, not the original intention.

6. **Request Confirmation**
   Ask whether the result matches expectations.

   - If **approved**:
     - Bump version in `package.json` following semver:
       - Patch (`x.x.+1`): bug fixes, regex corrections, internal refactors
       - Minor (`x.+1.0`): new bank support, new input types
       - Major (`+1.0.0`): breaking API changes
     - Delete `PLAN.md`
     - Task is complete

   - If **changes are requested**:
     - Update `PLAN.md`
     - Update `SPEC.md` (if behavior changes)
     - Repeat the process

---

## Adding a New Bank Parser

When adding support for a new bank:

1. Create `src/parsers/<bankname>.ts` implementing `(text: string) => KreditTransaction[]`.
2. Add a new `BankType` enum value in `src/types.ts`.
3. Add a `case` branch in `baseParseKredit` in `src/core.ts`.
4. Document the new parser in `SPEC.md` Section 5 (Parser Specifications) and Section 2 (Supported Banks table).
5. Note date format — does it include year (`MM/DD/YY`) or not (`MM/DD`)?
6. Note amount sign convention — how are credits/payments represented in the raw text?

---

## Hallucination Prevention

Use only:
- `SPEC.md`
- The existing codebase

If something is missing or unclear: **ask, don't assume**.

If a mismatch is detected between the code and `SPEC.md`:
- **Stop and flag it immediately** before proceeding.

---

## Definition of Done

A task is only complete when:

- Code is implemented
- Build passes (`npm run build`)
- Format check passes (`npm run format:check`)
- Tests are updated and passing (if a test suite exists)
- `SPEC.md` is updated and accurate
- `package.json` version is bumped appropriately
- User has confirmed correctness
- `PLAN.md` is deleted
