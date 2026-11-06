import dayjs from 'dayjs';

export const CUSTOM_TEXT_MAX_LENGTH = 888;

/** 自定义文稿按空格化的单行文本处理 */
export function normalizeCustomText(text: string): string {
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, CUSTOM_TEXT_MAX_LENGTH);
}

/** 图表对比使用文本 hash，避免不同本机文稿互相比较 */
export function getCustomTextKey(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `custom:${(hash >>> 0).toString(36)}`;
}

export function downloadCustomText(text: string, name = ''): void {
  const safeName =
    name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .slice(0, 40) || 'typing-custom';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}-${dayjs().format('YYYYMMDD-HHmm')}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
