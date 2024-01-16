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

export type LeaderBoardType = {
  accuracy: string;
  duration: number;
  type: string;
  userId: string;
  userName: string;
  wpm: string;
  objectId: string;
  createdAt: string;
};
