import { defineStore } from 'pinia';
import { getMe, getConfig } from '@/request/index';

export type profileType = {
  isAdmin: boolean;
  userName: string;
  id: string;
  userId: string;
  avatar: string;
  question: string;
  answer: string;
  iat: number;
  exp: number;
};

export type configType = {
  showRemind: boolean;
  latestUserId: string;
  region: string;
  remind: string;
  updatedAt: string;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: {} as profileType | {},
    config: {} as configType | {}
  }),
  getters: {
    myUserId(): any {
      if ('userId' in this.profile) {
        return this.profile.userId;
      }
      return '';
    }
  },
  actions: {
    setProfile() {
      getMe()
        .then((res) => {
          const info = res.data?.result?.info;
          if (info) {
            this.profile = info;
          }
        })
        .catch((e) => {
          console.log(e);
          this.profile = {};
        });
    },
    setConfig() {
      getConfig()
        .then((res) => {
          const config = res.data?.result?.config;
          if (config) {
            this.config = config;
          }
        })
        .catch((e) => {
          console.log(e);
          this.config = {};
        });
    }
  }
});
