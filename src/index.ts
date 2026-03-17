import type {
  CastlingRights,
  Color,
  File,
  Piece,
  PieceType,
  Position,
  Rank,
  Square,
} from '@echecs/position';

export type { Position } from '@echecs/position';

interface ParseError {
  column: number;
  line: number;
  message: string;
  offset: number;
}

interface ParseWarning {
  column: number;
  line: number;
  message: string;
  offset: number;
}

interface ParseOptions {
  onError?: (error: ParseError) => void;
  onWarning?: (warning: ParseWarning) => void;
}

export type { ParseError, ParseOptions, ParseWarning };

export const STARTING_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const FILES: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS: Rank[] = ['8', '7', '6', '5', '4', '3', '2', '1'];

function makeError(message: string): ParseError {
  return { column: 0, line: 0, message, offset: 0 };
}

function makeWarning(message: string): ParseWarning {
  return { column: 0, line: 0, message, offset: 0 };
}

function parsePlacement(
  placement: string,
  onWarning?: (w: ParseWarning) => void,
): Map<Square, Piece> | null {
  const board = new Map<Square, Piece>();
  const ranks = placement.split('/');

  if (ranks.length !== 8) {
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  for (const [rankIndex, rankString] of ranks.entries()) {
    const rank = RANKS[rankIndex];
    if (rank === undefined || rankString === undefined) {
      // eslint-disable-next-line unicorn/no-null
      return null;
    }

    let fileIndex = 0;
    for (const char of rankString) {
      const emptyCount = Number.parseInt(char, 10);
      if (Number.isNaN(emptyCount)) {
        const color: Color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as PieceType;
        const file = FILES[fileIndex];
        if (file === undefined) {
          // eslint-disable-next-line unicorn/no-null
          return null;
        }
        board.set(`${file}${rank}` as Square, { color, type });
        fileIndex += 1;
      } else {
        fileIndex += emptyCount;
      }
    }

    if (fileIndex !== 8) {
      onWarning?.(
        makeWarning(
          `Invalid FEN rank "${rankString}": expected 8 files, got ${fileIndex}`,
        ),
      );
      // eslint-disable-next-line unicorn/no-null
      return null;
    }
  }

  return board;
}

function parseCastling(castling: string): CastlingRights {
  return {
    bK: castling.includes('k'),
    bQ: castling.includes('q'),
    wK: castling.includes('K'),
    wQ: castling.includes('Q'),
  };
}

function stringifyPlacement(board: Map<Square, Piece>): string {
  const rankStrings: string[] = [];

  for (const rank of RANKS) {
    let rankString = '';
    let emptyCount = 0;

    for (const file of FILES) {
      const p = board.get(`${file}${rank}` as Square);
      if (p === undefined) {
        emptyCount += 1;
      } else {
        if (emptyCount > 0) {
          rankString += String(emptyCount);
          emptyCount = 0;
        }
        rankString += p.color === 'w' ? p.type.toUpperCase() : p.type;
      }
    }

    if (emptyCount > 0) {
      rankString += String(emptyCount);
    }
    rankStrings.push(rankString);
  }

  return rankStrings.join('/');
}

function stringifyCastling(rights: CastlingRights): string {
  let result = '';
  if (rights.wK) {
    result += 'K';
  }
  if (rights.wQ) {
    result += 'Q';
  }
  if (rights.bK) {
    result += 'k';
  }
  if (rights.bQ) {
    result += 'q';
  }
  return result.length > 0 ? result : '-';
}

export default function parse(
  input: string,
  options?: ParseOptions,
): Position | null {
  const content = input.replace(/^\uFEFF/, '').trim();

  if (content.length === 0) {
    options?.onError?.(makeError('Input is empty'));
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const parts = content.split(' ');
  if (parts.length !== 6) {
    options?.onError?.(makeError(`Expected 6 FEN fields, got ${parts.length}`));
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const [
    placement,
    turnString,
    castlingString,
    epString,
    halfString,
    fullString,
  ] = parts as [string, string, string, string, string, string];

  const board = parsePlacement(placement, options?.onWarning);
  if (board === null) {
    options?.onError?.(makeError(`Invalid piece placement: "${placement}"`));
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  if (turnString !== 'w' && turnString !== 'b') {
    options?.onError?.(makeError(`Invalid active color: "${turnString}"`));
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  const castlingRights = parseCastling(castlingString);
  const enPassantSquare: Square | undefined =
    epString === '-' ? undefined : (epString as Square);

  const halfmoveClock = Number.parseInt(halfString, 10);
  const fullmoveNumber = Number.parseInt(fullString, 10);

  if (Number.isNaN(halfmoveClock)) {
    options?.onWarning?.(
      makeWarning(`Invalid halfmove clock: "${halfString}"`),
    );
  }

  if (Number.isNaN(fullmoveNumber)) {
    options?.onWarning?.(
      makeWarning(`Invalid fullmove number: "${fullString}"`),
    );
  }

  return {
    board,
    castlingRights,
    enPassantSquare,
    fullmoveNumber: Number.isNaN(fullmoveNumber) ? 1 : fullmoveNumber,
    halfmoveClock: Number.isNaN(halfmoveClock) ? 0 : halfmoveClock,
    turn: turnString,
  };
}

export function stringify(position: Position): string {
  const placement = stringifyPlacement(position.board);
  const castling = stringifyCastling(position.castlingRights);
  const enPassant = position.enPassantSquare ?? '-';

  return [
    placement,
    position.turn,
    castling,
    enPassant,
    String(position.halfmoveClock),
    String(position.fullmoveNumber),
  ].join(' ');
}
