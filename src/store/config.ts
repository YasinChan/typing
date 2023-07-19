import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    currentFont: 'default' as string,
    keyboardModalStatus: false as boolean,
    printContent: '' as string,
    currentCode: [] as any[]
  }),
  actions: {
    setCurrentFont(val: string) {
      this.currentFont = val;
    },
    setKeyboardModalStatus(val: boolean) {
      this.keyboardModalStatus = val;
    },
    setPrintContent(val: string) {
      this.printContent += val;
    },
    minusPrintContent() {
      this.printContent = this.printContent.slice(0, -1);
    },
    setCurrentCode(val: string) {
      const date = new Date();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();
      const millisecond = date.getMilliseconds();
      const time = `${hour}:${minute}:${second}.${Math.floor(millisecond / 10)}`;
      this.currentCode.push(`<br>${time} ${val}`);

      if (this.currentCode.length > 3) {
        this.currentCode.shift(); // 删除第一个元素
      }
    }
  }
});
