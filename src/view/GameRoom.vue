<script setup lang="ts">
import { reactive, watch, inject, onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { TypingRecordType } from '@/types';

// api
import { getWsById } from '@/request';

// components
import YInput from '@/components/ui/Input.vue';
import YButton from '@/components/ui/Button.vue';
import Draggable from '@/components/ui/Draggable.vue';

// common
import { base64ToString } from '@/common/string';

// files
import Sentence from '@/files/Quote.json';

// stores
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/store/game';

// utils
import { userProfileDeferred } from '@/utils/defer';
import WordInput from '@/components/WordInput.vue';

const gamerStore = useGameStore();
const { setting, isFromGame } = storeToRefs(gamerStore);
const confirm: any = inject('confirm');
const message: any = inject('message');

interface IPlayer {
  [key: string]: {
    isReady: boolean;
    isOwner: boolean;
  };
}

const state = reactive({
  quote: null as any, // [] 或 {}
  isSpaceType: false,
  isTyping: false,
  selectTime: 15 as number, // 设置的倒计时
  countDown: null as null | number, // 实时倒计时
  intervalId: null as null | number,
  typingRecord: {} as TypingRecordType,
  ws: null as any,
  value: '',
  getValue: '',
  getName: '',
  isOwner: false,
  currentRoom: '' as any,
  player: {} as IPlayer,
  youIsReady: false
});

const wordInputRef = ref<any>(null);
const router = useRouter();

const routerId = computed(() => router.currentRoute.value.params.id || '');
const routerName = computed(() => {
  if (router.currentRoute.value.query.name) {
    return decodeURIComponent(router.currentRoute.value.query.name as string);
  } else {
    return '';
  }
});

onMounted(async () => {
  if (!isFromGame.value) {
    router.replace({
      name: 'Game'
    });
    return;
  }
  state.currentRoom = routerId.value;

  try {
    const res = await userProfileDeferred;
    const currentRoomBelong = base64ToString(routerId.value as string);
    state.isOwner = res.userName === currentRoomBelong;

    const id = routerId.value as string;
    const name = routerName.value as string;
    if (state.isOwner && setting.value) {
      const count = setting.value[res.userName]?.count || '';
      const countDown = setting.value[res.userName]?.countDown || 15;
      const index = setting.value[res.userName]?.index || 0;
      if (id && name) {
        startWs(id, name, count, countDown, index);
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
    const id = routerId.value as string;
    const name = routerName.value as string;
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

  await getList();
});

async function getList() {
  try {
    const res = await getWsById({ id: routerId.value as string });
    const data = res.data?.result?.ws;

    const { countDown = 15, index = 0 } = data;
    state.selectTime = Number(countDown);

    const sen = Object.values(Sentence.long);
    state.quote = sen[Number(index)];
    if (data && data.player) {
      for (let w in data['player']) {
        state.player[w] = state.player[w] || {};
        state.player[w].isOwner = data['player'][w].isOwner;
        state.player[w].isReady = data['player'][w].isReady;
      }
    }
  } catch (e) {
    console.log('----------', 'e', e, '----------cyy log');
  }
}

watch(
  () => state.value,
  (val) => {
    state.ws.send(
      JSON.stringify({
        id: routerId.value,
        name: routerName.value,
        info: val
      })
    );
  }
);

function startWs(
  id: string,
  name: string,
  count: number | string = '',
  countDown: number = 15,
  index: number = 0
) {
  // 创建 WebSocket 连接
  state.ws = new WebSocket(
    `${
      import.meta.env.VITE_WS_URL
    }?id=${id}&name=${name}&count=${count}&count_down=${countDown}&index=${index}`
  );
  // window.ws = state.ws;
  // 连接打开时的事件
  state.ws.onopen = function () {
    console.log('WebSocket 连接已打开！');
    // 发送一个字符串到服务器
    state.ws.send(
      JSON.stringify({
        id: routerId.value,
        name: routerName.value,
        action: ['enter'],
        info: `加入房间`
      })
    );
  };
  // 接收到服务器消息时的事件
  state.ws.onmessage = function (event: MessageEvent) {
    console.log('收到服务器消息：' + event.data);
    const data = JSON.parse(event.data);
    if (data.action && data.action.length) {
      webSocketAction(data);
    }
    if (data.type === 'remind') {
      // 房间在没有操作的情况下可以维持五分钟，还剩五秒会被关闭时 websocket 会发这个事件来提醒。
      message({ message: data.info, type: 'warn', timeout: 5000 });
      return;
    }
    state.getValue = data.info;
    state.getName = data.name;
  };
  // 连接关闭时的事件
  state.ws.onclose = function (e: CloseEvent) {
    console.log('WebSocket 连接已关闭！', e.code);
    if (e.code === 3001) {
      // 没有这个房间哦，请重新创建。
      confirm({
        title: e.reason,
        ok: '去创建房间',
        confirmClose: () => {
          router.replace({
            name: 'Game'
          });
          return true;
        },
        confirm: () => {
          router.replace({
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
          router.replace({
            name: 'Game'
          });
          return true;
        },
        confirm: () => {
          router.replace({
            name: 'Game'
          });
          return true;
        }
      });
      return;
    }
    if (e.code === 3002) {
      // 房间人数已满，请加入其他房间或者重新创建。
      confirm({
        title: e.reason,
        ok: '去创建房间',
        confirmClose: () => {
          router.replace({
            name: 'Game'
          });
          return true;
        },
        confirm: () => {
          router.replace({
            name: 'Game'
          });
          return true;
        }
      });
      return;
    }
    if (e.code === 3003) {
      // 超时关闭
      location.reload();
      return;
    }
  };
  // 连接出错时的事件
  state.ws.onerror = function (error: Error) {
    console.log('WebSocket 错误：' + error);
  };
}

interface WebSocketAction {
  action: string[];
  info: string;
  name: string;
}

function webSocketAction(data: WebSocketAction) {
  data.action.forEach((action) => {
    switch (action) {
      case 'ready':
        state.player[data.name].isReady = true;
        break;
      case 'cancelReady':
        state.player[data.name].isReady = false;
        break;
      case 'enter':
        getList();
        // 玩家进入房间
        break;
    }
  });
}

function closeRoom() {
  state.ws.close(3000, state.currentRoom);
  router.replace({
    name: 'Game'
  });
}

function ready() {
  if (state.youIsReady) {
    state.player[routerName.value].isReady = false;
    state.ws.send(
      JSON.stringify({
        id: routerId.value,
        name: routerName.value,
        info: `取消准备`,
        action: ['cancelReady']
      })
    );
    state.youIsReady = false;
    return;
  }
  state.player[routerName.value].isReady = true;
  state.ws.send(
    JSON.stringify({
      id: routerId.value,
      name: routerName.value,
      info: `已准备`,
      action: ['ready']
    })
  );
  state.youIsReady = true;
}

function isTypingFunc() {
  state.isTyping = true;
}

watch(
  () => state.isTyping,
  (val) => {
    if (val && state.selectTime) {
      state.countDown = state.selectTime;
      state.intervalId = setInterval(() => {
        if (state.countDown) {
          state.countDown -= 1;
          if (state.countDown < 1) {
            if (state.intervalId !== null) {
              clearInterval(state.intervalId);
              state.intervalId = null;
              state.typingRecord = wordInputRef.value?.getTypingRecord();
            }
          }
        }
      }, 1000);
    } else {
      // message({ message: '已结束' });
      state.countDown = null;
      if (state.intervalId !== null) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    }
  }
);
</script>

<template>
  <Draggable>
    <div class="y-game-room__remind">*请注意不要刷新页面，这可能导致房间无法再次进入。</div>
    <div class="y-game-room__online">
      <div class="y-game-room__online-title">当前在线：</div>
      <div v-for="(item, key) in state.player" class="flex-center--y-between" :key="key">
        <div class="y-game-room__owner">
          <span>{{ key }}</span>
          <span class="y-game-room__label" v-if="item.isOwner">房主</span>
        </div>
        <div class="y-game-room__ready" v-if="item.isReady">已准备</div>
      </div>
    </div>
    <div class="y-game-room__btn flex-center--y-between">
      <YButton :theme="state.youIsReady ? 'secondary' : 'default'" @click="ready">{{
        state.youIsReady ? '取消准备' : '准备'
      }}</YButton>
      <YButton v-if="state.isOwner" @click="closeRoom">关闭房间</YButton>
    </div>
  </Draggable>
  <main class="y-game-room">
    <div style="font-size: 28px; font-weight: bold; margin-bottom: 20px">
      功能还差一点哦，再等等~
    </div>
    <div class="y-game-room__header">
      <!--      <div v-if="state.isOwner">房主</div>-->
    </div>
    <span>{{ state.getName }}</span
    >:
    <span>{{ state.getValue }}</span>
    <YInput v-model="state.value"></YInput>
    <div class="y-game-room__setting">
      <div>{{ state.countDown || state.selectTime }}</div>
      <div
        v-if="state.countDown || state.selectTime"
        class="y-game-room__count-down"
        :class="[state.countDown ? 'y-game-room__count-down--active' : '']"
      >
        {{ state.countDown || state.selectTime }}
      </div>
    </div>
    <WordInput
      ref="wordInputRef"
      v-if="state.quote"
      :is-space-type="state.isSpaceType"
      :quote="state.quote?.content"
      @is-typing="isTypingFunc"
    ></WordInput>
  </main>
</template>

<style lang="scss">
.y-game-room__remind {
  color: $gray-06;
}
.y-game-room__online {
  margin-top: 10px;
}
.y-game-room__online-title {
  margin-bottom: 4px;
  font-weight: bold;
}
.y-game-room__label {
  background: $main-color;
  color: $gray-08;
  transform: scale(0.8);
  display: inline-block;
  line-height: 16px;
  font-size: 14px;
  padding: 2px;
  border-radius: 4px;
}
.y-game-room__ready {
  color: $main-color;
  font-size: 12px;
}
.y-game-room__btn {
  margin-top: 10px;
}

.y-game-room__setting {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
}

.y-game-room__count-down {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  color: $gray-04;
  font-size: 22px;
  font-weight: bold;
  &.y-game-room__count-down--active {
    color: $main-color;
  }
}
</style>
