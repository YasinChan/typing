import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    onlyShowMain: false as boolean,
    currentFont: 'default' as string,
    printContent: '' as string,
    currentCode: [] as any[],
    isEscape: false as boolean,
    capsLockOn: false,
    customThemeConfig: ''
  }),
  actions: {
    setCustomThemeConfig(val: string) {
      this.customThemeConfig = val;
    },
    setIsEscape(val: boolean) {
      this.isEscape = val;
    },
    setCapsLockOn(val: boolean) {
      this.capsLockOn = val;
    },
    setOnlyShowMain(val: boolean) {
      this.onlyShowMain = val;
    },
    setCurrentFont(val: string) {
      this.currentFont = val;
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
