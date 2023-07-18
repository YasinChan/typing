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

export const KEY_PERMUTATION: any = {
  'main-area': [
    [
      { key: 'Esc', unit: 1 },
      { key: '1', unit: 1 },
      { key: '2', unit: 1 },
      { key: '3', unit: 1 },
      { key: '4', unit: 1 },
      { key: '5', unit: 1 },
      { key: '6', unit: 1 },
      { key: '7', unit: 1 },
      { key: '8', unit: 1 },
      { key: '9', unit: 1 },
      { key: '0', unit: 1 },
      { key: '-', unit: 1 },
      { key: '=', unit: 1 },
      { key: 'Backspace', unit: 2 },
      { key: '`', unit: 1 }
    ],
    [
      { key: 'Tab', unit: 15 },
      { key: 'q', unit: 1 },
      { key: 'w', unit: 1 },
      { key: 'e', unit: 1 },
      { key: 'r', unit: 1 },
      { key: 't', unit: 1 },
      { key: 'y', unit: 1 },
      { key: 'u', unit: 1 },
      { key: 'i', unit: 1 },
      { key: 'o', unit: 1 },
      { key: 'p', unit: 1 },
      { key: '[', unit: 1 },
      { key: ']', unit: 1 },
      { key: '\\', unit: 15 },
      { key: 'Del', unit: 1 }
    ],
    [
      { key: 'CapsLock', unit: 175 },
      { key: 'a', unit: 1 },
      { key: 's', unit: 1 },
      { key: 'd', unit: 1 },
      { key: 'f', unit: 1 },
      { key: 'g', unit: 1 },
      { key: 'h', unit: 1 },
      { key: 'j', unit: 1 },
      { key: 'k', unit: 1 },
      { key: 'l', unit: 1 },
      { key: ';', unit: 1 },
      { key: "'", unit: 1 },
      { key: 'Enter', unit: 225 },
      { key: 'PageUp', unit: 1 }
    ],
    [
      { key: 'ShiftLeft', unit: 225 },
      { key: 'z', unit: 1 },
      { key: 'x', unit: 1 },
      { key: 'c', unit: 1 },
      { key: 'v', unit: 1 },
      { key: 'b', unit: 1 },
      { key: 'n', unit: 1 },
      { key: 'm', unit: 1 },
      { key: ',', unit: 1 },
      { key: '.', unit: 1 },
      { key: '/', unit: 1 },
      { key: 'ShiftRight', unit: 175 },
      { key: 'ArrowUp', unit: 1 },
      { key: 'PageDown', unit: 1 }
    ],
    [
      { key: 'Ctrl', unit: 125 },
      { key: 'Win', unit: 125 },
      { key: 'Alt', unit: 125 },
      { key: 'Space', unit: 7 },
      { key: 'Alt', unit: 1 },
      { key: 'Win', unit: 1 },
      { key: 'Ctrl', unit: 1 },
      { key: 'ArrowLeft', unit: 1 },
      { key: 'ArrowDown', unit: 1 },
      { key: 'ArrowRight', unit: 1 }
    ]
  ]
};
