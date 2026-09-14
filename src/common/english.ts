import ENGLISH_PASSAGES from '@/files/english-passages.json';

export type EnglishWordOptions = {
  punctuation?: boolean;
};

export type EnglishWordItem = {
  text: string;
  typed: string;
  submitted: boolean;
  /** 原文词下标，开关切换时用来原地重分词，避免换篇 */
  rawIndex: number;
};

type EnglishPassage = {
  title: string;
  author: string;
  source: string;
  text: string;
};

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** 统一引号和空白，按空格切出原文词 */
function normalizePassage(text: string): string[] {
  return text
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, ' ')
    .replace(/_/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

/** 按标点开关过滤单个原文词；文稿里偶尔出现的数字随原文保留 */
function filterToken(raw: string, options: EnglishWordOptions): string | null {
  let token = raw;
  if (!options.punctuation) {
    // 去掉词首词尾标点，保留 don't / Alice's 这类撇号
    token = token.replace(/^[^A-Za-z0-9']+/, '').replace(/[^A-Za-z0-9']+$/, '');
  }
  if (!token) return null;
  const hasLetter = /[A-Za-z]/.test(token);
  const hasDigit = /[0-9]/.test(token);
  if (!hasLetter && !hasDigit) return null;
  return token;
}

/** 把公版英文文稿拆成词，按开关决定是否保留标点 */
export function tokenizeEnglishPassage(text: string, options: EnglishWordOptions = {}): string[] {
  const words: string[] = [];
  for (const raw of normalizePassage(text)) {
    const token = filterToken(raw, options);
    if (token) words.push(token);
  }
  return words;
}

/** 按篇输出连贯词流；开关切换只改过滤，不洗牌换篇 */
export function createEnglishPassageStream() {
  let rawTokens: string[] = [];
  let cursor = 0;
  let options: EnglishWordOptions = {};

  function appendPassages() {
    const passages = shuffle(ENGLISH_PASSAGES as EnglishPassage[]);
    rawTokens.push(...passages.flatMap((item) => normalizePassage(item.text)));
  }

  function takeNextWord(): { text: string; rawIndex: number } {
    // 纯标点可能被滤掉，继续往后找下一个有效词
    while (true) {
      if (cursor >= rawTokens.length) appendPassages();
      const rawIndex = cursor;
      const word = filterToken(rawTokens[cursor], options);
      cursor += 1;
      if (word) return { text: word, rawIndex };
    }
  }

  return {
    reset(nextOptions: EnglishWordOptions = {}) {
      options = nextOptions;
      rawTokens = [];
      cursor = 0;
      appendPassages();
    },
    setOptions(nextOptions: EnglishWordOptions) {
      options = nextOptions;
    },
    setCursor(rawIndex: number) {
      cursor = Math.max(0, rawIndex);
    },
    next(count: number) {
      if (!rawTokens.length) appendPassages();
      const result: { text: string; rawIndex: number }[] = [];
      while (result.length < count) {
        result.push(takeNextWord());
      }
      return result;
    }
  };
}

export function createEnglishWordItems(
  count: number,
  options: EnglishWordOptions = {},
  stream?: ReturnType<typeof createEnglishPassageStream>
): EnglishWordItem[] {
  const source = stream ?? createEnglishPassageStream();
  if (!stream) source.reset(options);
  return source.next(count).map((item) => ({
    text: item.text,
    rawIndex: item.rawIndex,
    typed: '',
    submitted: false
  }));
}

/** 把当前词拆成字母状态，供 Monkeytype 风格渲染 */
export function buildEnglishLetters(word: EnglishWordItem) {
  const expected = word.text.split('');
  const typed = word.typed.split('');
  const length = Math.max(expected.length, typed.length);
  const letters: { char: string; status: 'pending' | 'correct' | 'incorrect' | 'extra' | 'missed' }[] =
    [];
  for (let i = 0; i < length; i++) {
    if (i < expected.length && i < typed.length) {
      letters.push({
        char: expected[i],
        status: typed[i] === expected[i] ? 'correct' : 'incorrect'
      });
    } else if (i < expected.length) {
      letters.push({
        char: expected[i],
        status: word.submitted ? 'missed' : 'pending'
      });
    } else {
      letters.push({
        char: typed[i],
        status: 'extra'
      });
    }
  }
  return letters;
}

export function buildEnglishRecordItem(word: EnglishWordItem) {
  // 回放只记录已经打出的字母；pending 是目标词剩余部分，写进去会让整词一次性蹦出来
  const letters = buildEnglishLetters(word).filter((letter) => letter.status !== 'pending');
  const wrongPos: number[] = [];
  letters.forEach((letter, index) => {
    if (letter.status === 'incorrect' || letter.status === 'extra' || letter.status === 'missed') {
      wrongPos.push(index);
    }
  });
  // 已提交的词补上空格，结果回放才不会把单词黏成一团
  return {
    word: letters.map((item) => item.char).join('') + (word.submitted ? ' ' : ''),
    isInput: true as const,
    wrongPos
  };
}
