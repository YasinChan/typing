/**
 * @description 替换字符串中的标点符号为空格
 * @param input
 */
export function replacePunctuationWithSpace(input: string): string {
  const punctuationRegex = /[.,;:!?(){}[\]\\/'"`“”‘’…—～，《》「」【】·、。！？；：]/gu; // 匹配大多数常见标点符号
  return input.replace(punctuationRegex, ' ').replace(/\s+/g, ' '); // 连续空格替换为一个空格
}

// 字符串转 Base64
export function stringToBase64(str: string | undefined): string | undefined {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    // 浏览器环境
    const encoder = new TextEncoder();
    const uint8array = encoder.encode(str);
    return btoa(uint8array.reduce((data, byte) => data + String.fromCharCode(byte), ''));
  }
  return str;
}

// Base64 转字符串
export function base64ToString(base64Str: string): string {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    // 浏览器环境
    const decodedData = atob(base64Str);
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(decodedData.split('').map((char) => char.charCodeAt(0))));
  }
  return base64Str;
}
