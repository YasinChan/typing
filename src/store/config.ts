import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    currentFont: 'default' as string,
    printContent: '' as string
  }),
  actions: {
    setCurrentFont(val: string) {
      this.currentFont = val;
    },
    setPrintContent(val: string) {
      this.printContent += val;
    },
    minusPrintContent() {
      this.printContent = this.printContent.slice(0, -1);
    }
  }
});
