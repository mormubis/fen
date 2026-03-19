type Color = 'b' | 'w';

type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

type PieceType = 'b' | 'k' | 'n' | 'p' | 'q' | 'r';

type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

type Square = `${File}${Rank}`;

interface CastlingRights {
  bK: boolean;
  bQ: boolean;
  wK: boolean;
  wQ: boolean;
}

interface Piece {
  color: Color;
  type: PieceType;
}

interface Position {
  board: Map<Square, Piece>;
  castlingRights: CastlingRights;
  enPassantSquare: Square | undefined;
  fullmoveNumber: number;
  halfmoveClock: number;
  turn: Color;
}

export type {
  CastlingRights,
  Color,
  File,
  Piece,
  PieceType,
  Position,
  Rank,
  Square,
};
