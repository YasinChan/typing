import dayjs from 'dayjs';

interface ZipFile {
  name: string;
  content: string;
}

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let value = i;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  CRC_TABLE[i] = value >>> 0;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date: Date) {
  const year = Math.min(2107, Math.max(1980, date.getFullYear()));
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  return { dosDate, dosTime };
}

function safeZipName(name: string) {
  const base = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 40);
  return base || '文稿';
}

function makeUniqueName(name: string, used: Set<string>) {
  const base = safeZipName(name).replace(/\.txt$/i, '') || '文稿';
  let candidate = `${base}.txt`;
  let index = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base} (${index}).txt`;
    index += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

/**
 * 生成 store-only ZIP（不压缩），用于批量导出本机文稿。
 * 使用 UTF-8 文件名标记，中文文件名在 macOS / Windows 资源管理器中可正常显示。
 */
export function downloadZip(files: ZipFile[], zipName = '') {
  if (!files.length) return;
  const encoder = new TextEncoder();
  const { dosDate, dosTime } = getDosDateTime(new Date());
  const usedNames = new Set<string>();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(makeUniqueName(file.name, usedNames));
    const contentBytes = encoder.encode(file.content);
    const checksum = crc32(contentBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length + contentBytes.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true); // UTF-8 file name
    localView.setUint16(8, 0, true); // store, no compression
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, contentBytes.length, true);
    localView.setUint32(22, contentBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);
    localHeader.set(contentBytes, 30 + nameBytes.length);
    localParts.push(localHeader);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, contentBytes.length, true);
    centralView.setUint32(24, contentBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    localOffset += localHeader.length;
  });

  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);

  const blob = new Blob([...localParts, ...centralParts, endRecord], {
    type: 'application/zip'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = zipName.trim() || `本机文稿-${dayjs().format('YYYYMMDD-HHmm')}.zip`;
  link.href = url;
  link.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
