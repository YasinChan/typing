<script setup lang="ts">
import { reactive, watch, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// api

// components
import YInput from '@/components/ui/Input.vue';

// common
import { base64ToString } from '@/common/string';

// stores
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/store/game';

// utils
import { userProfileDeferred } from '@/utils/defer';

const gamerStore = useGameStore();
const { setting, isFromGame } = storeToRefs(gamerStore);
const confirm: any = inject('confirm');

const state = reactive({
  ws: null as any,
  value: '',
  getValue: '',
  getName: '',
  isOwner: false,
  currentRoom: '' as any
});

const router = useRouter();

const currentRoute = router.currentRoute.value;

onMounted(async () => {
  if (!isFromGame.value) {
    router.replace({
      name: 'Game'
    });
    return;
  }
  try {
    const res = await userProfileDeferred;
    state.currentRoom = currentRoute?.params?.id;
    const currentRoomBelong = base64ToString(currentRoute?.params?.id as string);
    state.isOwner = res.userName === currentRoomBelong;

    const id = currentRoute.params?.id as string;
    const name = currentRoute.query?.name as string;
    if (state.isOwner && setting.value) {
      const count = setting.value[res.userName]?.count || '';
      if (id && name) {
        startWs(id, name, count);
      }
    } else if (id && name) {
      startWs(id, name);
    } else {
      confirm({
        title: '这是个空房间哦',
        ok: '去创建房间',
        confirmClose: () => {
          router.push({
            name: 'Game'
          });
          return true;
        },
        confirm: () => {
          router.push({
            name: 'Game'
          });
          return true;
        }
      });
    }
  } catch (e) {
    console.log('----------', 'e', '未登录', '----------cyy log');
    const id = currentRoute.params?.id as string;
    const name = currentRoute.query?.name as string;
    if (id && name) {
      startWs(id, name);
    } else {
      confirm({
        title: '这是个空房间哦',
        ok: '去创建房间',
        confirmClose: () => {
          router.push({
            name: 'Game'
          });
          return true;
        },
        confirm: () => {
          router.push({
            name: 'Game'
          });
          return true;
        }
      });
    }
  }
});

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

function startWs(id: string, name: string, count: number | string = '') {
  // 创建 WebSocket 连接
  state.ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?id=${id}&name=${name}&count=${count}`);
  // window.ws = state.ws;
  // 连接打开时的事件
  state.ws.onopen = function () {
    console.log('WebSocket 连接已打开！');
    // 发送一个字符串到服务器
    state.ws.send(
      JSON.stringify({
        id: router.currentRoute.value.params.id,
        name: router.currentRoute.value.query.name,
        info: `${name} 加入房间`
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
  state.ws.onclose = function (e: CloseEvent) {
    console.log('WebSocket 连接已关闭！', e.code);
    if (e.code === 3001) {
      confirm({
        title: e.reason,
        ok: '去创建房间',
        confirmClose: () => {
          router.push({
            name: 'Game'
          });
          return true;
        },
        confirm: () => {
          router.push({
            name: 'Game'
          });
          return true;
        }
      });
      return;
    }
    if (e.code === 3000 && !state.isOwner) {
      confirm({
        title: e.reason,
        ok: '去创建房间',
        confirmClose: () => {
          router.push({
            name: 'Game'
          });
          return true;
        },
        confirm: () => {
          router.push({
            name: 'Game'
          });
          return true;
        }
      });
      return;
    }
    if (e.code === 3002) {
      confirm({
        title: e.reason,
        ok: '去创建房间',
        confirmClose: () => {
          router.push({
            name: 'Game'
          });
          return true;
        },
        confirm: () => {
          router.push({
            name: 'Game'
          });
          return true;
        }
      });
      return;
    }
  };
  // 连接出错时的事件
  state.ws.onerror = function (error: Error) {
    console.log('WebSocket 错误：' + error);
  };
}

function closeRoom() {
  state.ws.close(3000, state.currentRoom);
  router.replace({
    name: 'Game'
  });
}
</script>

<template>
  <main class="y-game-room">
    <div class="y-game-room__remind">请注意不要刷新页面，这可能导致房间无法再次进入。</div>
    <div class="y-game-room__header">
      <div v-if="state.isOwner">房主</div>
      <div v-if="state.isOwner" @click="closeRoom">关闭房间</div>
    </div>
    <span>{{ state.getName }}</span
    >:
    <span>{{ state.getValue }}</span>
    <YInput v-model="state.value"></YInput>
  </main>
</template>

<style lang="scss"></style>
