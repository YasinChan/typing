import { COLOR_ENUM } from '@/types';

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

export function addOpacityToHex(colorHex: string, opacity: number): string {
  if (!isHexColor(colorHex)) {
    return '';
  }
  // 将16进制颜色转换为RGB
  const colorRgb = hexToRgb(colorHex);

  // 检查转换结果是否有效
  if (!colorRgb) {
    throw new Error('Invalid hex color format');
  }

  // 添加透明度（0.0-1.0之间）
  const colorRgba = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, ${opacity})`;

  // 返回 RGBA 格式的颜色字符串，因为16进制不支持透明度
  return colorRgba;
}

export function addOpacityToRgb(color: string, opacity: number): string {
  if (!isRgbColor(color)) {
    return '';
  }
  // 将RGB颜色转换为RGBA
  const colorRgb = color.replace('rgb', 'rgba').replace(')', ', ' + opacity + ')');

  // 返回 RGBA 格式的颜色字符串，因为16进制不支持透明度
  return colorRgb;
}

export function isHexColor(color: string): boolean {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullFormatRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

  return shorthandRegex.test(color) || fullFormatRegex.test(color);
}

export function isRgbColor(color: string): boolean {
  const rgbRegex = /^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/;
  const rgbaRegex = /^rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (-?\d*(?:\.\d+)?%?)\)$/; // 包含透明度的RGB格式

  return rgbRegex.test(color) || rgbaRegex.test(color);
}

/**
 * 将 16 进制颜色色值增加（即增加亮度）
 * @param hex
 * @param percent
 */
export function lightenHexColor(hex: string, percent: number) {
  // 将16进制颜色转换为RGB
  let r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  // 计算新的亮度值
  r = Math.min(255, Math.round(r + (255 - r) * percent));
  g = Math.min(255, Math.round(g + (255 - g) * percent));
  b = Math.min(255, Math.round(b + (255 - b) * percent));

  // 将RGB值转换回16进制颜色
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * 将 16 进制颜色色值减少（即减少亮度）
 * @param hex
 * @param percent
 */
export function darkenHexColor(hex: string, percent: number) {
  // 将16进制颜色转换为RGB
  let r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  // 计算新的暗度值
  r = Math.max(0, Math.round(r - r * percent));
  g = Math.max(0, Math.round(g - g * percent));
  b = Math.max(0, Math.round(b - b * percent));

  // 将RGB值转换回16进制颜色
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function getCustomCssValue(value: string, target: string = 'root') {
  if (target === 'root') {
    const rootElement = document.documentElement;
    const computedStyle = window.getComputedStyle(rootElement);
    return computedStyle.getPropertyValue(value);
  } else if (target === 'body') {
    const body = document.body;
    return body.style.getPropertyValue(value);
  }
  return '';
}
export function setCustomCssValue(css: string, value: string) {
  const body = document.body;
  body.style.setProperty(css, value);
}
export function removeCustomCssValue(value: string) {
  const body = document.body;
  body.style.removeProperty(value);
}
export function removeAllCustomCssValue() {
  removeCustomCssValue(COLOR_ENUM['MAIN_COLOR']);
  removeCustomCssValue(COLOR_ENUM['MAIN_RED']);
  removeCustomCssValue(COLOR_ENUM['BACKGROUND_COLOR']);
  removeCustomCssValue(COLOR_ENUM['LAYOUT_BACKGROUND_COLOR']);
  removeCustomCssValue(COLOR_ENUM['GRAY_08']);
  removeCustomCssValue(COLOR_ENUM['GRAY_06']);
  removeCustomCssValue(COLOR_ENUM['GRAY_04']);
  removeCustomCssValue(COLOR_ENUM['GRAY_02']);
  removeCustomCssValue(COLOR_ENUM['LABEL_WHITE']);
}

export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
