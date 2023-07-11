import { defineStore } from 'pinia';
import { getMe, getRegion } from '@/request/index';

export type profileType = {
  isAdmin: boolean;
  userName: string;
  id: string;
  iat: number;
  exp: number;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: {} as profileType | {},
    region: '' as string
  }),
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
    setRegion() {
      getRegion()
        .then((res) => {
          const region = res.data?.result?.region;
          if (region) {
            this.region = region;
          }
        })
        .catch((e) => {
          console.log(e);
          this.region = '';
        });
    }
  }
});
