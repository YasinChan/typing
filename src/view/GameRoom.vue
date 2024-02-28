<script setup lang="ts">
import { reactive, watch, inject, computed } from 'vue';
import { useRouter } from 'vue-router';

// api
import { getUserInfo, setPersonalInfo, updatePassword } from '@/request';

// components
import YModal from '@/components/ui/Modal.vue';
import YInput from '@/components/ui/Input.vue';
import YImage from '@/components/ui/Image.vue';

// config
import { EMAIL_REG, PASSWORD_REG } from '@/common/reg';

// stores
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

// utils
import { generateAvatar } from '@/utils/generate-avatar';

const userStore = useUserStore();
const { profile, myUserId } = storeToRefs(userStore);

const message: any = inject('message');

const state = reactive({
  ws: null as any,
  value: '',
  getValue: '',
  getName: ''
});

const router = useRouter();

watch(
  () => router.currentRoute.value,
  (val) => {
    console.log('----------', 'val', val, '----------cyy log');
    const id = val.params?.id as string;
    const name = val.query?.name as string;
    if (id && name) {
      startWs(id, name);
    }
  },
  {
    immediate: true
  }
);
watch(
  () => state.value,
  (val) => {
    state.ws.send(
      JSON.stringify({
        id: router.currentRoute.value.params.id,
        name: router.currentRoute.value.query.name,
        info: val
      })
    );
  }
);

function startWs(id: string, name: string) {
  // 创建 WebSocket 连接
  // state.ws = new WebSocket(`ws://localhost:8080?id=${id}&name=${name}`);
  state.ws = new WebSocket(`ws://typing.yasinchan.com//ws?id=${id}&name=${name}`);
  // window.ws = state.ws;
  // 连接打开时的事件
  state.ws.onopen = function () {
    console.log('WebSocket 连接已打开！');
    // 发送一个字符串到服务器
    state.ws.send(
      JSON.stringify({
        id: router.currentRoute.value.params.id,
        name: router.currentRoute.value.query.name,
        info: 'Hello, Server!'
      })
    );
  };
  // 接收到服务器消息时的事件
  state.ws.onmessage = function (event: MessageEvent) {
    console.log('收到服务器消息：' + event.data);
    const data = JSON.parse(event.data);
    state.getValue = data.info;
    state.getName = data.name;
  };
  // 连接关闭时的事件
  state.ws.onclose = function () {
    console.log('WebSocket 连接已关闭！');
  };
  // 连接出错时的事件
  state.ws.onerror = function (error: Error) {
    console.log('WebSocket 错误：' + error);
  };
}
</script>

<template>
  <div class="y-race y-main">
    <span>{{ state.getName }}</span
    >:
    <span>{{ state.getValue }}</span>
    <YInput v-model="state.value"></YInput>
  </div>
</template>

<style lang="scss"></style>
