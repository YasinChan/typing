// @ts-ignore
import { toSvg } from 'jdenticon';

export function generateAvatar(name: string, size: number = 40) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(toSvg(name, size))}`;
}
