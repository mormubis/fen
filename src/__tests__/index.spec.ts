import { describe, expect, it, vi } from 'vitest';

import parse, { STARTING_FEN, stringify } from '../index.js';

import type { ParseError } from '../index.js';

const STARTING = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('parse — failure cases', () => {
  it('returns null for empty input', () => {
    expect(parse('')).toBeNull();
  });

  it('calls onError for empty input', () => {
    const onError = vi.fn<(error: ParseError) => void>();
    parse('', { onError });
    expect(onError).toHaveBeenCalledOnce();
  });

  it('returns null for wrong field count', () => {
    expect(parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w')).toBeNull();
  });

  it('strips BOM', () => {
    expect(parse('\uFEFF' + STARTING)).not.toBeNull();
  });
});

describe('parse — starting position', () => {
  it('parses 32 pieces', () => {
    expect(parse(STARTING)?.board.size).toBe(32);
  });

  it('parses white to move', () => {
    expect(parse(STARTING)?.turn).toBe('w');
  });

  it('parses all castling rights', () => {
    expect(parse(STARTING)?.castlingRights).toEqual({
      bK: true,
      bQ: true,
      wK: true,
      wQ: true,
    });
  });

  it('parses no en passant square', () => {
    expect(parse(STARTING)?.enPassantSquare).toBeUndefined();
  });

  it('parses halfmove clock 0', () => {
    expect(parse(STARTING)?.halfmoveClock).toBe(0);
  });

  it('parses fullmove number 1', () => {
    expect(parse(STARTING)?.fullmoveNumber).toBe(1);
  });

  it('parses white king on e1', () => {
    expect(parse(STARTING)?.board.get('e1')).toEqual({
      color: 'w',
      type: 'k',
    });
  });

  it('parses black queen on d8', () => {
    expect(parse(STARTING)?.board.get('d8')).toEqual({
      color: 'b',
      type: 'q',
    });
  });
});

describe('parse — after e4', () => {
  const FEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

  it('parses black to move', () => {
    expect(parse(FEN)?.turn).toBe('b');
  });

  it('parses en passant square e3', () => {
    expect(parse(FEN)?.enPassantSquare).toBe('e3');
  });

  it('parses white pawn on e4', () => {
    expect(parse(FEN)?.board.get('e4')).toEqual({ color: 'w', type: 'p' });
  });

  it('parses empty e2', () => {
    expect(parse(FEN)?.board.get('e2')).toBeUndefined();
  });
});

describe('parse — castling variants', () => {
  it('parses no castling rights', () => {
    expect(parse('4k3/8/8/8/8/8/8/4K3 w - - 0 1')?.castlingRights).toEqual({
      bK: false,
      bQ: false,
      wK: false,
      wQ: false,
    });
  });

  it('parses partial castling rights', () => {
    expect(parse('4k3/8/8/8/8/8/8/4K3 w Kq - 0 1')?.castlingRights).toEqual({
      bK: false,
      bQ: true,
      wK: true,
      wQ: false,
    });
  });
});

describe('stringify', () => {
  it('round-trips starting position', () => {
    expect(stringify(parse(STARTING)!)).toBe(STARTING);
  });

  it('round-trips position with en passant', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    expect(stringify(parse(fen)!)).toBe(fen);
  });

  it('round-trips position with no castling', () => {
    const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    expect(stringify(parse(fen)!)).toBe(fen);
  });
});

describe('STARTING_FEN', () => {
  it('equals the standard starting position FEN', () => {
    expect(STARTING_FEN).toBe(STARTING);
  });
});
