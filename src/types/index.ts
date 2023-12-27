export type KeyBoardType = '68' | 'standard' | 'mbp';

export type SystemType = 'mac' | 'win';

export type SentenceArrItem = {
  id: number;
  word: string;
  isInput: boolean;
  isWrong: boolean;
};

export type TypingRecordItemType = {
  cursorPosition?: number;
  word?: string;
  isInput?: boolean;
  isComposition?: boolean;
  isWrong?: boolean;
  wrongPos?: number[];
};
export type TypingRecordType = {
  [key: number]: TypingRecordItemType[];
};
