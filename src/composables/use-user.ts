import { computed } from 'vue';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';

export function useUser() {
  const userStore = useUserStore();
  const { profile, getProvinceUser, myUserId } = storeToRefs(userStore);

  const isLogin = computed(() => {
    return !!myUserId.value;
  });

  const userName = computed(() => {
    if (isLogin.value) {
      return profile.value?.userName;
    } else if (getProvinceUser.value) {
      return getProvinceUser.value;
    }
    return '';
  });

  return {
    userName,
    isLogin
  };
}
