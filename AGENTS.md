# AGENTS.md

Agent guidance for the `@echecs/fen` package — FEN parser/serialiser.

See the root `AGENTS.md` for workspace-wide conventions.

---

## Project Overview

Parses FEN (Forsyth–Edwards Notation) strings into `Position` objects and
serialises them back. Default export `parse()` never throws — returns `null` on
failure. Named export `stringify()` always succeeds.

API mirrors `@echecs/trf`.

---

## Dependency Graph

```
@echecs/position
     ↑
@echecs/fen
```

---

## FEN Format

Six space-separated fields:

1. Piece placement (rank 8 → rank 1, `/` separated)
2. Active color (`w`/`b`)
3. Castling rights (`KQkq` or `-`)
4. En passant square (`e3` or `-`)
5. Halfmove clock (integer)
6. Fullmove number (integer)

---

## Commands

```bash
pnpm build && pnpm test && pnpm lint
```
