import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    currentFont: 'default' as string
  }),
  actions: {
    setCurrentFont(val: string) {
      this.currentFont = val;
    }
  }
});
