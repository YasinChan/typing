<script setup lang="ts">
import { reactive, watch, inject, onMounted, computed, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import type { IWebsocketInfos, IWebsocketTypingInfo } from '@/types';
import dayjs from 'dayjs';

// api
import { getWsById } from '@/request';

// components
import YButton from '@/components/ui/Button.vue';
import YDraggable from '@/components/ui/Draggable.vue';
import YLoading from '@/components/ui/Loading.vue';
import YModal from '@/components/ui/Modal.vue';

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
  showRemindStart: false,
  countDownStartTime: 3,
  selectedQuoteIndex: 0,
  quote: null as any, // [] 或 {}
  isSpaceType: false,
  isTyping: false,
  selectTime: 15 as number, // 设置的倒计时
  countDown: 0 as number, // 实时倒计时
  intervalId: null as null | number,
  ws: null as any,
  websocketInfos: [] as Partial<IWebsocketInfos>[], // 这里是包含 action 的信息，比如“已准备”“取消准备”等。
  websocketTypingInfo: {} as IWebsocketTypingInfo, // 输入中的相关信息，比如字数、正确率等。
  getName: '',
  isOwner: false,
  currentRoom: '' as any,
  player: {} as IPlayer,
  youIsReady: false,
  isAllReady: false, // 是否已经都准备好了
  isStart: false // 是否已经开始了
});

const wordInputRef = ref<InstanceType<typeof WordInput>>();
const draggableRef = ref<InstanceType<typeof YDraggable>>();

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
  } catch (_e) {
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
});

async function getList() {
  try {
    const res = await getWsById({ id: routerId.value as string });
    const data = res.data?.result?.ws;

    const { countDown = 15, index = 0 } = data;
    state.selectTime = Number(countDown);

    const sen = Object.values(Sentence.long);
    state.selectedQuoteIndex = Number(index);
    state.quote = sen[Number(index)];
    state.player = {};
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
    state.getName = data.name;

    if (data.typing) {
      state.websocketTypingInfo[data.name] = {
        len: data.typing.len,
        accuracy: data.typing.accuracy
      };
    }

    if (data.action && data.action.length) {
      if (state.websocketInfos.length >= 2) {
        state.websocketInfos.shift();
      }
      state.websocketInfos.push({
        name: data.name,
        info: data.info,
        action: data.action,
        time: dayjs().format('HH:mm:ss')
      });
    }
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

  setTimeout(async () => {
    await getList();
  }, 500);
}

interface WebSocketAction {
  action: string[];
  info: string;
  name: string;
}

// 接收到服务器消息时，对其中的 action 进行操作。
function webSocketAction(data: WebSocketAction) {
  data.action.forEach((action) => {
    switch (action) {
      case 'ready':
        state.player[data.name].isReady = true;
        break;
      case 'cancelReady':
        state.player[data.name].isReady = false;
        break;
      case 'start':
        state.isStart = true;
        startCountDown();
        break;
      case 'end':
        resetGameStatus();
        break;
      case 'enter':
      case 'exit':
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

function exitRoom() {
  state.ws.send(
    JSON.stringify({
      id: routerId.value,
      name: routerName.value,
      action: ['exit'],
      info: `退出房间`
    })
  );
  router.replace({
    name: 'Game'
  });
}

// 取消准备
function cancelReady() {
  if (state.player[routerName.value].isReady) {
    state.player[routerName.value].isReady = false;
    state.ws.send(
      JSON.stringify({
        id: routerId.value,
        name: routerName.value,
        info: `取消准备`,
        action: ['cancelReady']
      })
    );
  }
  state.youIsReady = false;
}
function ready() {
  if (state.youIsReady) {
    cancelReady();
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

function startGame() {
  state.ws.send(
    JSON.stringify({
      id: routerId.value,
      name: routerName.value,
      action: ['start'],
      info: `即将开始！`
    })
  );
}

async function resetQuote() {
  wordInputRef.value?.blurInput();
  getTypingInfo({
    wordLength: 0,
    accuracy: '0%'
  });

  state.quote = null;
  await nextTick();
  const sen = Object.values(Sentence.long);
  state.quote = sen[state.selectedQuoteIndex];
  await nextTick();
  setTimeout(() => {
    wordInputRef.value?.blurInput();
  }, 0);
}
// 房主点了开始游戏按钮，每个玩家都弹框倒计时提示。
function startCountDown() {
  resetQuote();

  state.showRemindStart = true;
  let intervalId = setInterval(() => {
    state.countDownStartTime = state.countDownStartTime - 1;
    if (state.countDownStartTime < 1) {
      clearInterval(intervalId);
      state.countDownStartTime = 3;
      state.showRemindStart = false;

      draggableRef.value?.hideContent();
      wordInputRef.value?.focusInput();

      // state.ws.send(
      //   JSON.stringify({
      //     id: routerId.value,
      //     name: routerName.value,
      //   }
      // }
      startTypingFunc();
    }
  }, 1000);
}

// 开始游戏
function startTypingFunc() {
  wordInputRef.value?.focusInput();
  state.countDown = state.selectTime;
  // TODO 这里是使用的 setInterval 做的倒计时，可能会被浏览器影响，更好的方式是由 websocket 提供倒计时。
  state.intervalId = setInterval(() => {
    state.countDown -= 1;
    if (state.countDown < 1) {
      if (state.intervalId !== null) {
        state.ws.send(
          JSON.stringify({
            id: routerId.value,
            name: routerName.value,
            action: ['end'],
            info: `游戏结束`
          })
        );
      }
    }
  }, 1000);
}

function resetGameStatus() {
  resetQuote();
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.countDown = 0;
  draggableRef.value?.showContent();
  cancelReady();
  state.isStart = false;
}

function isTypingFunc() {
  state.isTyping = true;
}

function getTypingInfo({ wordLength, accuracy }: { wordLength: number; accuracy: string }) {
  state.ws.send(
    JSON.stringify({
      id: routerId.value,
      name: routerName.value,
      typing: {
        len: wordLength,
        accuracy: accuracy
      }
    })
  );
}

// watch(
//   () => state.isTyping,
//   (val) => {
//     if (val && state.selectTime) {
//       state.countDown = state.selectTime;
//       state.intervalId = setInterval(() => {
//         if (state.countDown) {
//           state.countDown -= 1;
//           if (state.countDown < 1) {
//             if (state.intervalId !== null) {
//               clearInterval(state.intervalId);
//               state.intervalId = null;
//               // xxx
//             }
//           }
//         }
//       }, 1000);
//     } else {
//       // message({ message: '已结束' });
//       state.countDown = null;
//       if (state.intervalId !== null) {
//         clearInterval(state.intervalId);
//         state.intervalId = null;
//       }
//     }
//   }
// );

watch(
  () => state.player,
  (val) => {
    state.isAllReady = Object.values(state.player).every((item) => item.isReady);
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<template>
  <YDraggable ref="draggableRef">
    <template #remind>
      <div class="y-game-room__draggable-header-wrap">
        <div
          v-for="item in state.websocketInfos"
          :key="item.time"
          class="y-game-room__draggable-header flex-center--y"
        >
          <span style="width: 70px">{{ item.time }}</span>
          <span
            style="width: 190px; margin-right: 8px"
            v-if="
              !(
                item.action &&
                item.action.length &&
                (item.action.includes('start') || item.action.includes('end'))
              )
            "
            >{{ item.name === routerName ? '你' : item.name }}</span
          >
          <span>{{ item.info }}</span>
        </div>
      </div>
    </template>
    <div class="y-game-room__remind">*请注意不要刷新页面，这可能导致房间无法再次进入。</div>
    <div class="y-game-room__online">
      <div class="y-game-room__online-title">当前在线：</div>
      <template v-if="Object.keys(state.player).length">
        <div v-for="(item, key) in state.player" class="flex-center--y-between" :key="key">
          <div class="y-game-room__owner">
            <span>{{ key }}</span>
            <span class="y-game-room__label" v-if="item.isOwner">房主</span>
            <span class="y-game-room__label" v-if="key === routerName">你</span>
          </div>
          <div class="y-game-room__ready" v-if="item.isReady">已准备</div>
        </div>
      </template>
      <YLoading class="y-game-room__online-loading" v-else></YLoading>
    </div>
    <div class="y-game-room__btn flex-center--y-between">
      <div class="flex-center--y-between">
        <YButton
          :theme="state.youIsReady ? 'secondary' : 'default'"
          @click="ready"
          :disable="state.isStart"
          >{{ state.youIsReady ? '取消准备' : '准备' }}</YButton
        >
        <YButton
          style="margin-left: 5px"
          :disable="!state.isAllReady || state.isStart"
          v-if="state.isOwner"
          @click="startGame"
          >开始游戏</YButton
        >
      </div>
      <YButton v-if="state.isOwner" :disable="state.isStart" @click="closeRoom">关闭房间</YButton>
      <YButton v-else :disable="state.isStart" @click="exitRoom">退出房间</YButton>
    </div>
  </YDraggable>
  <main class="y-game-room">
    <div style="font-size: 28px; font-weight: bold; margin-bottom: 20px">
      功能还差一点哦，再等等~
    </div>
    <div class="y-game-room__header">
      <!--      <div v-if="state.isOwner">房主</div>-->
    </div>
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
      :is-show-progress="true"
      :progress-info="state.websocketTypingInfo"
      :is-space-type="state.isSpaceType"
      :quote="state.quote?.content"
      @typing-info="getTypingInfo"
      @is-typing="isTypingFunc"
    ></WordInput>
    <YLoading class="y-game-room__loading" v-else></YLoading>
  </main>
  <YModal
    :show="state.showRemindStart"
    @close="state.showRemindStart = false"
    :z-index="10"
    :show-close-btn="false"
    :close-on-click-mask="false"
  >
    <template #header>
      <h3>即将开始！</h3>
    </template>
    <template #body>
      <div class="y-game-room__modal-content gray-08">
        游戏将在
        <span class="main-color" style="display: inline-block; width: 10px; text-align: center">{{
          state.countDownStartTime
        }}</span>
        秒后开始，请做好准备！
      </div>
    </template>
    <template #footer>
      <div></div>
    </template>
  </YModal>
</template>

<style lang="scss">
.y-game-room {
  .y-word-input__wrap,
  .y-word-input {
    height: 280px;
  }
}
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
.y-game-room__online-loading {
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
.y-game-room__loading {
  position: fixed;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.y-game-room__draggable-header-wrap {
  font-size: 14px;
  padding: 0 10px 10px;
}
.y-game-room__draggable-header {
  span {
    @include limit-line(1);
  }
}
</style>
