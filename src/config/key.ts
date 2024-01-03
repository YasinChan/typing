/**
 * @description 键盘键帽上有两个字符的映射表。
 */
export const SUB_VALUE: Record<string, string> = {
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

export enum KEY_PERMUTATION_KEY {
  MAIN_AREA = 'main-area',
  SUB_AREA = 'sub-area',
  NUMBER_AREA = 'number-area'
}

/**
 * @description 键盘每个键帽的映射表。
 * code: 键盘键帽的键码。
 * unit: 键盘键帽的宽度。
 * value: 键盘键帽的值。
 * type: 键盘键帽的类型，toggle 表示切换键。
 * macValue: 键盘键帽的对应 Mac 上的值。
 * macCode: 键盘键帽的对应 Mac 上的键码。
 * area: 键盘键帽的子区域，比如 MBP 上的上下左右是两行并一行的。
 */
export type KEY_PERMUTATION_VALUE = {
  code?: string;
  unit?: number;
  value?: string;
  type?: string;
  macValue?: string;
  macCode?: string;
  area?: Array<Array<KEY_PERMUTATION_VALUE>>;
};

export type KEY_PERMUTATION_TYPE = Partial<
  Record<KEY_PERMUTATION_KEY, Array<Array<KEY_PERMUTATION_VALUE>>>
>;

export enum KEY_CODE_ENUM {
  BACKSPACE = 'Backspace',
  TAB = 'Tab',
  ENTER = 'Enter',
  SHIFT = 'Shift',
  CONTROL = 'Control',
  ALT = 'Alt',
  CAPS_LOCK = 'CapsLock',
  ESCAPE = 'Escape',
  SPACE = 'Space',
  PAGE_UP = 'PageUp',
  PAGE_DOWN = 'PageDown',
  END = 'End',
  HOME = 'Home',
  ARROW_LEFT = 'ArrowLeft',
  ARROW_UP = 'ArrowUp',
  ARROW_RIGHT = 'ArrowRight',
  ARROW_DOWN = 'ArrowDown',
  PRINT_SCREEN = 'PrintScreen',
  INSERT = 'Insert',
  DELETE = 'Delete',
  CONTEXT_MENU = 'ContextMenu',
  NUM_LOCK = 'NumLock',
  SCROLL_LOCK = 'ScrollLock',
  PAUSE = 'Pause',
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  F13 = 'F13',
  F14 = 'F14',
  F15 = 'F15',
  F16 = 'F16',
  F17 = 'F17',
  F18 = 'F18',
  F19 = 'F19',
  F20 = 'F20',
  F21 = 'F21',
  F22 = 'F22',
  F23 = 'F23',
  F24 = 'F24',
  DIGIT_0 = 'Digit0',
  DIGIT_1 = 'Digit1',
  DIGIT_2 = 'Digit2',
  DIGIT_3 = 'Digit3',
  DIGIT_4 = 'Digit4',
  DIGIT_5 = 'Digit5',
  DIGIT_6 = 'Digit6',
  DIGIT_7 = 'Digit7',
  DIGIT_8 = 'Digit8',
  DIGIT_9 = 'Digit9',
  KEY_A = 'KeyA',
  KEY_B = 'KeyB',
  KEY_C = 'KeyC',
  KEY_D = 'KeyD',
  KEY_Z = 'KeyZ'
}

export const CAN_PRINT_KEY: Record<string, string> = {
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

export const KEY_PERMUTATION_68: KEY_PERMUTATION_TYPE = {
  [KEY_PERMUTATION_KEY.MAIN_AREA]: [
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
      { code: 'ControlLeft', unit: 125, value: 'Ctrl', macValue: '⌃' },
      { code: 'Win', unit: 125, value: 'Win', macValue: '⌥', macCode: 'AltLeft' },
      { code: 'AltLeft', unit: 125, value: 'Alt', macValue: '⌘', macCode: 'MetaLeft' },
      { code: 'Space', unit: 7, value: 'Space' },
      { code: 'AltRight', unit: 1, value: 'Alt', macValue: '⌘', macCode: 'MetaRight' },
      { code: 'Win', unit: 1, value: 'Win', macValue: '⌥', macCode: 'AltRight' },
      { code: 'ControlRight', unit: 1, value: 'Ctrl', macValue: '⌃' },
      { code: 'ArrowLeft', unit: 1, value: '←' },
      { code: 'ArrowDown', unit: 1, value: '↓' },
      { code: 'ArrowRight', unit: 1, value: '→' }
    ]
  ]
};

export const KEY_PERMUTATION_STANDARD: KEY_PERMUTATION_TYPE = {
  [KEY_PERMUTATION_KEY.MAIN_AREA]: [
    [
      { code: 'Escape', unit: 1, value: 'Esc' },
      { code: 'F1', unit: 1, value: 'F1' },
      { code: 'F2', unit: 1, value: 'F2' },
      { code: 'F3', unit: 1, value: 'F3' },
      { code: 'F4', unit: 1, value: 'F4' },
      { code: 'F5', unit: 1, value: 'F5' },
      { code: 'F6', unit: 1, value: 'F6' },
      { code: 'F7', unit: 1, value: 'F7' },
      { code: 'F8', unit: 1, value: 'F8' },
      { code: 'F9', unit: 1, value: 'F9' },
      { code: 'F10', unit: 1, value: 'F10' },
      { code: 'F11', unit: 1, value: 'F11' },
      { code: 'F12', unit: 1, value: 'F12' }
    ],
    [
      { code: 'Backquote', unit: 1, value: '`' },
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
      { code: 'Backspace', unit: 2, value: 'Backspace' }
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
      { code: 'Backslash', unit: 15, value: '\\' }
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
      { code: 'Enter', unit: 25, value: 'Enter' }
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
      { code: 'ShiftRight', unit: 3, value: 'Shift' }
    ],
    [
      { code: 'ControlLeft', unit: 125, value: 'Ctrl', macValue: '⌃' },
      { code: 'MetaLeft', unit: 125, value: 'Win', macValue: '⌥', macCode: 'AltLeft' },
      { code: 'AltLeft', unit: 125, value: 'Alt', macValue: '⌘', macCode: 'MetaLeft' },
      { code: 'Space', unit: 7, value: 'Space' },
      { code: 'AltRight', unit: 125, value: 'Alt', macValue: '⌘', macCode: 'MetaRight' },
      { code: 'MetaRight', unit: 125, value: 'Win', macValue: '⌥', macCode: 'AltRight' },
      { code: 'ContextMenu', unit: 125, value: 'Menu' },
      { code: 'ControlRight', unit: 125, value: 'Ctrl', macValue: '⌃' }
    ]
  ],
  [KEY_PERMUTATION_KEY.SUB_AREA]: [
    [
      { code: 'PrintScreen', unit: 1, value: 'Pri \n Scn' },
      { code: 'ScrollLock', unit: 1, value: 'Scrl \n Lock' },
      { code: 'Pause', unit: 1, value: 'Pas' }
    ],
    [
      { code: 'Insert', unit: 1, value: 'Ins' },
      { code: 'Home', unit: 1, value: 'Hom' },
      { code: 'PageUp', unit: 1, value: 'Pg \n Up' }
    ],
    [
      { code: 'Delete', unit: 1, value: 'Del' },
      { code: 'End', unit: 1, value: 'End' },
      { code: 'PageDown', unit: 1, value: 'Pg \n Dn' }
    ],
    [{}, {}, {}],
    [{}, { code: 'ArrowUp', unit: 1, value: '↑' }, {}],
    [
      { code: 'ArrowLeft', unit: 1, value: '←' },
      { code: 'ArrowDown', unit: 1, value: '↓' },
      { code: 'ArrowRight', unit: 1, value: '→' }
    ]
  ],
  [KEY_PERMUTATION_KEY.NUMBER_AREA]: [
    [{}, {}, {}, {}],
    [
      { code: 'NumLock', unit: 1, value: 'Num \n Lock' },
      { code: 'NumpadDivide', unit: 1, value: '/ ' },
      { code: 'NumpadMultiply', unit: 1, value: '* ' },
      { code: 'NumpadSubtract', unit: 1, value: '- ' }
    ],
    [
      { code: 'Numpad7', unit: 1, value: '7 ' },
      { code: 'Numpad8', unit: 1, value: '8 ' },
      { code: 'Numpad9', unit: 1, value: '9 ' },
      { code: 'NumpadAdd', unit: 1, value: '+ ' }
    ],
    [
      { code: 'Numpad4', unit: 1, value: '4 ' },
      { code: 'Numpad5', unit: 1, value: '5 ' },
      { code: 'Numpad6', unit: 1, value: '6 ' },
      { code: 'NumpadEnter', unit: 1, value: 'Enter' }
    ],
    [
      { code: 'Numpad1', unit: 1, value: '1 ' },
      { code: 'Numpad2', unit: 1, value: '2 ' },
      { code: 'Numpad3', unit: 1, value: '3 ' },
      {}
    ],
    [
      { code: 'Numpad0', unit: 1, value: '0 ' },
      { code: 'NumpadDecimal', unit: 1, value: '. ' },
      { code: 'NumpadEqual', unit: 1, value: '= ' },
      {}
    ]
  ]
};

export const KEY_PERMUTATION_MBP: KEY_PERMUTATION_TYPE = {
  [KEY_PERMUTATION_KEY.MAIN_AREA]: [
    [
      { code: 'Escape', unit: 1, value: 'Esc' },
      { code: 'F1', unit: 1, value: 'F1' },
      { code: 'F2', unit: 1, value: 'F2' },
      { code: 'F3', unit: 1, value: 'F3' },
      { code: 'F4', unit: 1, value: 'F4' },
      { code: 'F5', unit: 1, value: 'F5' },
      { code: 'F6', unit: 1, value: 'F6' },
      { code: 'F7', unit: 1, value: 'F7' },
      { code: 'F8', unit: 1, value: 'F8' },
      { code: 'F9', unit: 1, value: 'F9' },
      { code: 'F10', unit: 1, value: 'F10' },
      { code: 'F11', unit: 1, value: 'F11' },
      { code: 'F12', unit: 1, value: 'F12' }
    ],
    [
      { code: 'Backquote', unit: 1, value: '`' },
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
      { code: 'Backspace', unit: 2, value: 'Backspace' }
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
      { code: 'Backslash', unit: 15, value: '\\' }
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
      { code: 'Enter', unit: 25, value: 'Enter' }
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
      { code: 'ShiftRight', unit: 3, value: 'Shift' }
    ],
    [
      { code: 'Fn', unit: 1, value: 'Fn' },
      { code: 'ControlLeft', unit: 1, value: 'Ctrl', macValue: '⌃' },
      { code: 'MetaLeft', unit: 1, value: 'Win', macValue: '⌘', macCode: 'AltLeft' },
      { code: 'AltLeft', unit: 1, value: 'Alt', macValue: '⌥', macCode: 'MetaLeft' },
      { code: 'Space', unit: 7, value: 'Space' },
      { code: 'MetaRight', unit: 125, value: 'Win', macValue: '⌘', macCode: 'MetaRight' },
      { code: 'AltRight', unit: 1, value: 'Alt', macValue: '⌥', macCode: 'AltRight' },
      {
        type: 'inner',
        area: [
          [{}, { code: 'ArrowUp', unit: 1, value: '↑' }, {}],
          [
            { code: 'ArrowLeft', unit: 1, value: '←' },
            { code: 'ArrowDown', unit: 1, value: '↓' },
            { code: 'ArrowRight', unit: 1, value: '→' }
          ]
        ]
      }
    ]
  ]
};
