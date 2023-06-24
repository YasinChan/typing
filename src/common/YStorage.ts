const serialize = function (value) {
  if (!value) {
    return;
  }
  return JSON.stringify(value);
};

const safelyDeserialize = function (value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

export default {
  set(key, value) {
    if (!value) {
      return;
    }
    window.localStorage.setItem(key, serialize(value));
  },

  get(key) {
    if (!key) {
      return {};
    }
    const value = window.localStorage.getItem(key);
    return safelyDeserialize(value);
  },

  remove(key) {
    if (!key) {
      return;
    }
    this.storage.removeItem(key);
  },

  clear() {
    this.storage.clear();
  },

  // 批量
  // obj  e.：{ key: value, key1: value }
  setList(obj) {
    for (const key in obj) {
      this.set(key, obj[key]);
    }
  },

  // 通过key数组批量查询
  getList(keys) {
    return keys.map((key) => this.get(key));
  }
};
