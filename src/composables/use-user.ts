import { computed } from 'vue';
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';

export function useUser() {
  const userStore = useUserStore();
  const { profile, getProvinceUser } = storeToRefs(userStore);
  const replyName = computed(() => {
    if (profile.value?.userName) {
      return profile.value.userName;
    } else if (getProvinceUser.value) {
      return getProvinceUser.value;
    }
    return '';
  });

  return {
    replyName
  };
}
