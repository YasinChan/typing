type ValueType = Object | string | undefined | null;

function serialize(value: ValueType): string {
  if (!value) {
    return '';
  }
  return JSON.stringify(value);
}

const safelyDeserialize = function (value: string | undefined | null): Object {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

export default {
  set(key: string, value: ValueType) {
    if (!value) {
      return;
    }
    window.localStorage.setItem(key, serialize(value));
  },

  get(key: string): { [x: string]: any } {
    if (!key) {
      return {};
    }
    const value = window.localStorage.getItem(key);
    return safelyDeserialize(value);
  },

  remove(key: string) {
    if (!key) {
      return;
    }
    window.localStorage.removeItem(key);
  },

  clear() {
    window.localStorage.clear();
  },

  // 批量
  // obj  e.：{ key: value, key1: value }
  setList(obj: { [x: string]: ValueType }) {
    for (const key in obj) {
      this.set(key, obj[key]);
    }
  },

  // 通过key数组批量查询
  getList(keys: any[]) {
    return keys.map((key) => this.get(key));
  }
};
