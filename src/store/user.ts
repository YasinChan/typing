import { defineStore } from 'pinia';
import { getMe } from '@/request/index';

export type profileType = {
  isAdmin: boolean;
  userName: string;
  id: string;
  iat: number;
  exp: number;
};

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: {} as profileType | {}
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
    }
  }
});
