/**
 * @description 键盘键帽上有两个字符的映射表。
 */
export const SUB_VALUE: any = {
  '`': '~',
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '(',
  '0': ')',
  '-': '_',
  '=': '+',
  '[': '{',
  ']': '}',
  '\\': '|',
  ';': ':',
  "'": '"',
  ',': '<',
  '.': '>',
  '/': '?'
};

/**
 * @description 键盘每个键帽的映射表。
 * code: 键盘键帽的键码。
 * unit: 键盘键帽的宽度。
 * value: 键盘键帽的值。
 * type: 键盘键帽的类型，toggle 表示切换键。
 */
export const KEY_PERMUTATION: any = {
  'main-area': [
    [
      { code: 'Escape', unit: 1, value: 'Esc' },
      { code: 'Digit1', unit: 1, value: '1' },
      { code: 'Digit2', unit: 1, value: '2' },
      { code: 'Digit3', unit: 1, value: '3' },
      { code: 'Digit4', unit: 1, value: '4' },
      { code: 'Digit5', unit: 1, value: '5' },
      { code: 'Digit6', unit: 1, value: '6' },
      { code: 'Digit7', unit: 1, value: '7' },
      { code: 'Digit8', unit: 1, value: '8' },
      { code: 'Digit9', unit: 1, value: '9' },
      { code: 'Digit0', unit: 1, value: '0' },
      { code: 'Minus', unit: 1, value: '-' },
      { code: 'Equal', unit: 1, value: '=' },
      { code: 'Backspace', unit: 2, value: 'Backspace' },
      { code: 'Backquote', unit: 1, value: '`' }
    ],
    [
      { code: 'Tab', unit: 15, value: 'Tab' },
      { code: 'KeyQ', unit: 1, value: 'q' },
      { code: 'KeyW', unit: 1, value: 'w' },
      { code: 'KeyE', unit: 1, value: 'e' },
      { code: 'KeyR', unit: 1, value: 'r' },
      { code: 'KeyT', unit: 1, value: 't' },
      { code: 'KeyY', unit: 1, value: 'y' },
      { code: 'KeyU', unit: 1, value: 'u' },
      { code: 'KeyI', unit: 1, value: 'i' },
      { code: 'KeyO', unit: 1, value: 'o' },
      { code: 'KeyP', unit: 1, value: 'p' },
      { code: 'BracketLeft', unit: 1, value: '[' },
      { code: 'BracketRight', unit: 1, value: ']' },
      { code: 'Backslash', unit: 15, value: '\\' },
      { code: 'Delete', unit: 1, value: 'Del' }
    ],
    [
      { code: 'CapsLock', unit: 175, value: 'CapsLock', type: 'toggle' },
      { code: 'KeyA', unit: 1, value: 'a' },
      { code: 'KeyS', unit: 1, value: 's' },
      { code: 'KeyD', unit: 1, value: 'd' },
      { code: 'KeyF', unit: 1, value: 'f' },
      { code: 'KeyG', unit: 1, value: 'g' },
      { code: 'KeyH', unit: 1, value: 'h' },
      { code: 'KeyJ', unit: 1, value: 'j' },
      { code: 'KeyK', unit: 1, value: 'k' },
      { code: 'KeyL', unit: 1, value: 'l' },
      { code: 'Semicolon', unit: 1, value: ';' },
      { code: 'Quote', unit: 1, value: "'" },
      { code: 'Enter', unit: 225, value: 'Enter' },
      { code: 'PageUp', unit: 1, value: 'PgUp' }
    ],
    [
      { code: 'ShiftLeft', unit: 225, value: 'Shift' },
      { code: 'KeyZ', unit: 1, value: 'z' },
      { code: 'KeyX', unit: 1, value: 'x' },
      { code: 'KeyC', unit: 1, value: 'c' },
      { code: 'KeyV', unit: 1, value: 'v' },
      { code: 'KeyB', unit: 1, value: 'b' },
      { code: 'KeyN', unit: 1, value: 'n' },
      { code: 'KeyM', unit: 1, value: 'm' },
      { code: 'Comma', unit: 1, value: ',' },
      { code: 'Period', unit: 1, value: '.' },
      { code: 'Slash', unit: 1, value: '/' },
      { code: 'ShiftRight', unit: 175, value: 'Shift' },
      { code: 'ArrowUp', unit: 1, value: '↑' },
      { code: 'PageDown', unit: 1, value: 'PgDn' }
    ],
    [
      { code: 'ControlLeft', unit: 125, value: 'Ctrl' },
      { code: 'Win', unit: 125, value: 'Win' },
      { code: 'AltLeft', unit: 125, value: 'Alt' },
      { code: 'Space', unit: 7, value: 'Space' },
      { code: 'AltRight', unit: 1, value: 'Alt' },
      { code: 'Win', unit: 1, value: 'Win' },
      { code: 'ControlRight', unit: 1, value: 'Ctrl' },
      { code: 'ArrowLeft', unit: 1, value: '←' },
      { code: 'ArrowDown', unit: 1, value: '↓' },
      { code: 'ArrowRight', unit: 1, value: '→' }
    ]
  ]
};

export const CAN_PRINT_KEY: any = {
  KeyQ: 'q',
  KeyW: 'w',
  KeyE: 'e',
  KeyR: 'r',
  KeyT: 't',
  KeyY: 'y',
  KeyU: 'u',
  KeyI: 'i',
  KeyO: 'o',
  KeyP: 'p',
  KeyA: 'a',
  KeyS: 's',
  KeyD: 'd',
  KeyF: 'f',
  KeyG: 'g',
  KeyH: 'h',
  KeyJ: 'j',
  KeyK: 'k',
  KeyL: 'l',
  KeyZ: 'z',
  KeyX: 'x',
  KeyC: 'c',
  KeyV: 'v',
  KeyB: 'b',
  KeyN: 'n',
  KeyM: 'm',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',
  Digit0: '0',
  Minus: '-',
  Equal: '=',
  Backquote: '`',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  Space: ' '
};
