/**
 * 计算单位分钟内输入的单词数量，这里可以计算中文词组或者英文单词
 * @param text
 * @param timeInMinutes
 */
export function calculateWordWPM(text: string, timeInMinutes: number): string {
  // 假设输入的文本中单词以空格分隔
  const words = text.split(' ');
  // 计算输入的单词数
  const wordCount = words.length;
  // 计算每分钟的单词数
  const wordsPerMinute = wordCount / timeInMinutes;
  // 返回结果
  return wordsPerMinute.toFixed(2);
}

/**
 * 计算单位时间内中文字数
 * @param text
 * @param timeInMinutes
 */
export function calculateChineseWPM(text: string, timeInMinutes: number): string {
  // 移除文本中的空格和换行符
  const cleanedText = text.replace(/\s/g, '');

  // 计算输入的字数
  const characterCount = cleanedText.length;

  // 计算每分钟的字数
  const charactersPerMinute = characterCount / timeInMinutes;

  // 返回结果
  return charactersPerMinute.toFixed(2);
}
