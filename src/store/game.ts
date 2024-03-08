import { defineStore, storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

type settingValueType = {
  count: number;
};
type settingType = {
  [key: string]: settingValueType;
};
export const useGameStore = defineStore('game', {
  state: () => ({
    setting: {} as any,
    isFromGame: false as boolean // 这是是否来自 /game 页面，如果不是，则 /game/xxx 游戏房间页面则不可以显示。
  }),
  actions: {
    setSetting(userName: string, val: settingValueType) {
      this.setting[userName] = val;
    },
    setMySetting(val: settingValueType) {
      const { myUserName } = useUserStore();
      if (!myUserName) {
        return;
      }
      this.setting[myUserName] = val;
    },
    getSettingCount(userName: string) {
      // const { myUserName } = useUserStore();
      // if (!myUserName) {
      //   return '';
      // }
      return this.setting[userName];
    },
    setIsFromGame(val: boolean) {
      this.isFromGame = val;
    }
  }
});
