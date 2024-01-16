import { defineStore } from 'pinia';
import { getMe, getConfig } from '@/request/index';
import { nanoid } from 'nanoid';

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
  ipId: string;
  latestUserId: string;
  region: Record<string, any>;
  remind: string;
  updatedAt: string;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: {} as Partial<profileType>,
    config: {} as Partial<configType>
  }),
  getters: {
    myUserId(): any {
      if ('userId' in this.profile) {
        return this.profile.userId;
      }
      return '';
    },
    regionFormat(): string[] {
      if ('region' in this.config) {
        const region = this.config.region?.region || '';
        // 国家|区域|省份|城市|ISP
        return region.split('|');
      }
      return [];
    },
    getProvince(): string {
      if (this.regionFormat.length) {
        return this.regionFormat[2];
      }
      return '';
    },
    getProvinceUser(): string {
      if (this.regionFormat.length) {
        let id = '';
        if (this.config?.ipId) {
          id = this.config?.ipId;
        } else {
          id = nanoid(4);
        }
        return `来自${this.regionFormat[2]}的网友 - ${id}`;
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
