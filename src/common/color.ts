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
