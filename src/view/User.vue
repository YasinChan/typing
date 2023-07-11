<script setup lang="ts">
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';
import { getUserInfo } from '@/request/index';
import { reactive } from 'vue';

const userStore = useUserStore();
const { profile } = storeToRefs(userStore);

const state = reactive({
  info: {
    avatar: '',
    userName: ''
  }
});

const router = useRouter();
const id = router.currentRoute.value.params.id;

getUserInfo({ userId: String(id) }).then((res) => {
  state.info = res.data?.result;
});
</script>

<template>
  <div class="y-user">
    <div class="y-user__info">
      <img :src="state.info.avatar" alt="" />
      <div class="y-user__user-name">{{ state.info.userName }}</div>
    </div>
    <div class="y-user__setting">
      <div class="y-user__setting-avatar">设置头像</div>
    </div>
  </div>
</template>

<style lang="scss">
.y-user__info {
  display: flex;
}
</style>
