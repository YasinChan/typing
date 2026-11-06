import { nanoid } from 'nanoid';

export interface CustomTextRecord {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  /** 列表顺序，越小越靠前；旧数据没有该字段时会在读取时补齐 */
  order?: number;
}

const DB_NAME = 'typing-local';
const DB_VERSION = 2;
const STORE_NAME = 'custom-texts';
const LEGACY_STORE_NAME = 'custom-text';
const LEGACY_TEXT_KEY = 'current';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB is not supported'));
  }
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB is blocked'));
  });
}

/** 把旧版单篇自定义文稿迁移到新版文稿库，避免升级后数据消失 */
async function migrateLegacyText(db: IDBDatabase) {
  if (!db.objectStoreNames.contains(LEGACY_STORE_NAME)) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([LEGACY_STORE_NAME, STORE_NAME], 'readwrite');
    const legacyStore = transaction.objectStore(LEGACY_STORE_NAME);
    const request = legacyStore.get(LEGACY_TEXT_KEY);
    request.onsuccess = () => {
      const value = request.result;
      if (typeof value === 'string' && value.trim()) {
        const now = Date.now();
        transaction.objectStore(STORE_NAME).put({
          id: nanoid(),
          name: '本机文稿',
          content: value.trim(),
          createdAt: now,
          updatedAt: now,
          order: -now
        });
      }
      legacyStore.delete(LEGACY_TEXT_KEY);
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
}

function getDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabase()
      .then(async (db) => {
        await migrateLegacyText(db);
        return db;
      })
      .catch((error) => {
        dbPromise = null;
        throw error;
      });
  }
  return dbPromise;
}

function writeRecords(db: IDBDatabase, records: CustomTextRecord[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    records.forEach((record) => transaction.objectStore(STORE_NAME).put(record));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
}

export async function listCustomTexts(): Promise<CustomTextRecord[]> {
  const db = await getDatabase();
  const records = await new Promise<CustomTextRecord[]>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result || []) as CustomTextRecord[]);
    request.onerror = () => reject(request.error);
  });

  if (!records.length) return [];

  // 兼容没有 order 的旧数据：先按原来的更新时间排序，再把顺序写回
  if (records.some((record) => typeof record.order !== 'number')) {
    const sorted = [...records].sort((a, b) => b.updatedAt - a.updatedAt);
    sorted.forEach((record, index) => {
      record.order = index;
    });
    try {
      await writeRecords(db, sorted);
    } catch (error) {
      console.error('backfill custom text order failed', error);
    }
    return sorted;
  }

  return records.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || b.updatedAt - a.updatedAt);
}

export async function createCustomText(name: string, content: string): Promise<CustomTextRecord> {
  const now = Date.now();
  const record: CustomTextRecord = {
    id: nanoid(),
    name,
    content,
    createdAt: now,
    updatedAt: now,
    order: -now - Math.random()
  };
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => resolve(record);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
}

export async function updateCustomText(record: CustomTextRecord): Promise<CustomTextRecord> {
  const updated: CustomTextRecord = {
    ...record,
    updatedAt: Date.now(),
    order: record.order ?? -Date.now()
  };
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(updated);
    transaction.oncomplete = () => resolve(updated);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
}

export async function reorderCustomTexts(records: CustomTextRecord[]): Promise<void> {
  const db = await getDatabase();
  // 列表里可能是 Vue 的响应式 Proxy，IndexedDB 不能直接结构化克隆，先转成普通对象
  const plainRecords = records.map((record, index) => {
    record.order = index;
    return {
      id: record.id,
      name: record.name,
      content: record.content,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      order: index
    };
  });
  return writeRecords(db, plainRecords);
}

export async function deleteCustomText(id: string): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error || new Error('IndexedDB transaction aborted'));
  });
}
