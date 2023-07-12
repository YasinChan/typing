<script setup lang="ts">
import { useRouter } from 'vue-router';
import { getUserInfo } from '@/request/index';
import { reactive, watch } from 'vue';
import YImage from '@/components/ui/Image.vue';

import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const { profile } = storeToRefs(userStore);

const state = reactive({
  info: {
    avatar: '',
    userName: ''
  },
  paramsId: '' as any
});

const router = useRouter();

watch(
  () => router.currentRoute.value.params,
  (val) => {
    state.paramsId = val.id;
    getUserInfo({ userId: String(state.paramsId) }).then((res) => {
      state.info = res.data?.result;
    });
  },
  {
    immediate: true
  }
);
</script>

<template>
  <div class="y-user y-main">
    <div class="y-user__info">
      <y-image class="y-user__image" :src="state.info.avatar"></y-image>
      <div class="y-user__user-name">{{ state.info.userName }}</div>
    </div>
    <div v-if="'userId' in profile && profile.userId == state.paramsId" class="y-user__setting">
      <div class="y-user__setting-avatar">设置头像</div>
      <div class="y-user__setting-avatar">设置问题</div>
      <div class="y-user__setting-avatar">设置密码</div>
    </div>
  </div>
</template>

<style lang="scss">
.y-user__info {
  display: flex;
}
.y-user__image {
  width: 40px;
  height: 40px;
}
</style>
