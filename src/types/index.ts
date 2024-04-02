export type KeyBoardType = '68' | 'standard' | 'mbp';

export interface IWebsocketInfos {
  id: string;
  name: string;
  typing: string;
  info: string;
  action: string[];
  time: string;
  result: any;
}

export interface IWebsocketTyping {
  len: number;
  accuracy: string;
  name?: string;
  isLenLargest?: boolean;
  isAccuracyLargest?: boolean;
}

export interface IWebsocketTypingInfo {
  [key: string]: IWebsocketTyping;
}

export type SystemType = 'mac' | 'win';

export type SentenceArrItem = {
  id: number;
  word: string;
  isInput: boolean;
  isWrong: boolean;
  info: null | IWebsocketTyping[];
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

export type SuggestItem = {
  id: string;
  content: string;
  updatedAt: string;
  createdAt: string;
  userName: string;
  userId: string;
  up: number;
  canShow: boolean;
  down: number;
  accept: boolean;
  done: boolean;
  isTheme: boolean;
};

export enum COLOR_ENUM {
  MAIN_COLOR = '--main-color',
  MAIN_RED = '--main-red',
  BACKGROUND_COLOR = '--background-gray',
  LAYOUT_BACKGROUND_COLOR = '--layout-background-gray',
  GRAY_08 = '--gray-08',
  GRAY_06 = '--gray-06',
  GRAY_04 = '--gray-04',
  GRAY_02 = '--gray-02',
  LABEL_WHITE = '--label-white'
}

// 获取枚举的键类型
export type COLOR_KEY_TYPE = keyof typeof COLOR_ENUM | 'THEME_INPUT';

// 定义一个对象类型，其键使用枚举的键类型
export type COLOR_TYPE = {
  [key in COLOR_KEY_TYPE]: string; // 这里假设值类型为字符串，您可以根据实际情况替换
};

export type WsItem = {
  op: string;
  player: string[];
  time: number;
  count: number;
};
