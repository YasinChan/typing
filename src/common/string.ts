/**
 * @description 替换字符串中的标点符号为空格
 * @param input
 */
export function replacePunctuationWithSpace(input: string): string {
  const punctuationRegex = /[.,;:!?(){}[\]\\/'"`“”‘’…—～，《》「」【】·、。！？；：]/gu; // 匹配大多数常见标点符号
  return input.replace(punctuationRegex, ' ').replace(/\s+/g, ' '); // 连续空格替换为一个空格
}
