<script setup lang="ts">
import { reactive, watch, inject, computed } from 'vue';

// api
// import { creteGame } from '@/request';

// components
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';

// composables
import { useUser } from '@/composables/use-user';

const { replyName } = useUser();

const state = reactive({
  showSetting: false
});

async function confirm() {
  // try {
  //   const res = await creteGame({ userName: 'test', count: 2 });
  //   console.log('----------', 'res', res, '----------cyy log');
  // } catch (_e) {}
  state.showSetting = false;
}
</script>

<template>
  <main class="y-race">
    <h1>开发中，敬请期待！</h1>
    <div class="y-race__rule">在这里你可以创建比赛，并邀请好友一起参加。</div>
    <YButton @click="state.showSetting = true" disable>创建比赛</YButton>
  </main>
  <YModal :show="state.showSetting" @close="state.showSetting = false" @confirm="confirm">
    <template #header>
      <h3>设置</h3>
    </template>
    <template #body>
      <div class="y-race__setting gray-08">
        <div>身份：{{ replyName }}</div>
        <div>人数：2 人</div>
      </div>
    </template>
  </YModal>
</template>

<style lang="scss"></style>
