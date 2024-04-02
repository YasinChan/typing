<script setup lang="ts">
import { reactive, watch, inject, onMounted, computed, ref, nextTick, markRaw } from 'vue';
import Clipboard from 'clipboard';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

// types
import type { IWebsocketInfos, IWebsocketTypingInfo } from '@/types';

// api
import { getWsById } from '@/request';

// components
import YButton from '@/components/ui/Button.vue';
import YDraggable from '@/components/ui/Draggable.vue';
import YLoading from '@/components/ui/Loading.vue';
import YModal from '@/components/ui/Modal.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import YInput from '@/components/ui/Input.vue';

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
  saySomething: '',
  showRemindStart: false,
  countDownStartTime: 3,
  selectedQuoteIndex: 0,
  quote: null as any, // [] 或 {}
  isSpaceType: false,
  isTyping: false,
  selectTime: 15 as number, // 设置的倒计时
  countDown: 0 as number, // 实时倒计时
  intervalId: null as null | number,
  count: 2, // 房间可以容纳的玩家数量
  ws: null as any,
  websocketInfos: [] as Partial<IWebsocketInfos>[], // 这里是包含 action 的信息，比如“已准备”“取消准备”等。
  websocketTypingInfo: {} as IWebsocketTypingInfo, // 输入中的相关信息，比如字数、正确率等。
  getName: '',
  isOwner: false,
  currentRoom: '' as any,
  player: {} as IPlayer,
  youIsReady: false,
  isAllReady: false, // 是否已经都准备好了
  isStart: false, // 是否已经开始了
  showResult: false, // 是否展示结果
  recordResult: {} as IWebsocketTypingInfo // 比赛结果，是通过过程中发送的信息和个人的信息合并后的结果。
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

const recordResultComp = computed<IWebsocketTypingInfo>(() => {
  // 比赛结果找一下其中准确度和字符数最多的标记一下，渲染的时候高亮。
  let largestLen: string[] = [];
  let largestAccuracy: string[] = [];
  let result: IWebsocketTypingInfo = markRaw(state.recordResult);
  for (let item in state.recordResult) {
    const len = state.recordResult[item].len;
    const accuracy = state.recordResult[item].accuracy;
    if (largestLen.length) {
      const currentLargestLen = state.recordResult[largestLen[0]].len;
      if (len > currentLargestLen) {
        largestLen = [item];
      } else if (len === currentLargestLen) {
        largestLen.push(item);
      }
    } else {
      largestLen = [item];
    }
    if (largestAccuracy.length) {
      const currentLargestAccuracy = state.recordResult[largestAccuracy[0]].accuracy;
      if (getAccuracyNumber(accuracy) > getAccuracyNumber(currentLargestAccuracy)) {
        largestAccuracy = [item];
      } else if (getAccuracyNumber(accuracy) === getAccuracyNumber(currentLargestAccuracy)) {
        largestAccuracy.push(item);
      }
    } else {
      largestAccuracy = [item];
    }
  }

  function getAccuracyNumber(accuracy: string) {
    return Number(accuracy.replace('%', ''));
  }

  largestLen.forEach((item) => {
    result[item].isLenLargest = true;
  });
  largestAccuracy.forEach((item) => {
    result[item].isAccuracyLargest = true;
  });
  return result;
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

// 获取列表
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
    state.count = data?.count || 2;
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
      if (!(data.typing.len === 0 && data.typing.accuracy === '0%')) {
        // 结束的时候会发送清零的消息，这里是需要记录下结束之前的数据的，所以当有空信息就不记录。
        state.recordResult[data.name] = {
          len: data.typing.len,
          accuracy: data.typing.accuracy
        };
      }
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
    if (e.code === 3005) {
      // 被踢了
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
      case 'remove':
        getList();
        // 玩家进入房间/退出房间/被踢
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

// 准备
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

// 房主可以讲别人踢出去
function removePlayer(player: string | number) {
  state.ws.send(
    JSON.stringify({
      id: routerId.value,
      name: player,
      action: ['remove'],
      info: `被移出房间`
    })
  );
}

function sendMessage(msg: string) {
  state.ws.send(
    JSON.stringify({
      id: routerId.value,
      name: routerName.value,
      action: ['message'],
      info: msg
    })
  );
}

// 发送开始比赛信息
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

// 分享房间
function shareRoom() {
  const text = `${location.origin}/game?op=${router.currentRoute.value.params.id}`;
  const clipboard = new Clipboard('.btn', {
    text: () => text
  });

  clipboard.on('success', () => {
    message({ message: '复制成功，可以去分享了' });
    clipboard.destroy();
  });

  clipboard.on('error', () => {
    message({ message: '没复制成功，请手动复制这个链接后分享：' + text });
    clipboard.destroy();
  });

  // @ts-ignore
  clipboard.onClick(event);
}

// 重置文案和输入状态
async function resetQuote() {
  wordInputRef.value?.blurInput();
  getTypingInfo({
    isReset: true
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

// 倒计时三秒后开始游戏
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

// 游戏结束后的操作
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
  state.showResult = true;
}

function isTypingFunc() {
  state.isTyping = true;
}

function getTypingInfo({ wordLength, accuracy, isReset = false }: any) {
  if (isReset) {
    state.ws.send(
      JSON.stringify({
        id: routerId.value,
        name: routerName.value,
        typing: {
          len: 0,
          accuracy: '0%'
        }
      })
    );
    return;
  }

  // 这里是记录下自己的输入情况的，因为发送出去的只有别人的。
  state.recordResult[routerName.value] = {
    len: wordLength,
    accuracy: accuracy
  };
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
      <div class="y-game-room__online-title">
        当前在线：<span>{{ Object.keys(state.player)?.length }}/{{ state.count }}</span>
      </div>
      <template v-if="Object.keys(state.player).length">
        <div
          v-for="(item, key) in state.player"
          class="flex-center--y-between y-game-room__online-list"
          :key="key"
        >
          <div class="y-game-room__owner">
            <span>{{ key }}</span>
            <span class="y-game-room__label" v-if="item.isOwner">房主</span>
            <span class="y-game-room__label" v-if="key === routerName">你</span>
          </div>
          <div class="y-game-room__ready" v-if="item.isReady">已准备</div>
          <div
            class="y-game-room__ready y-game-room__remove cursor-pointer"
            v-if="!item.isReady && state.isOwner && !(key === routerName)"
            @click="removePlayer(key)"
          >
            踢了
          </div>
        </div>
      </template>
      <YLoading class="y-game-room__online-loading" v-else></YLoading>
    </div>
    <div class="y-game-room__say flex-center--y-between">
      <div class="flex-center--y">
        <span class="gray-06">说些什么：</span>
        <YInput v-model="state.saySomething" placeholder="说吧。" :max-length="6" />
      </div>
      <YDropDown>
        <template #title>
          <div class="y-game-room__modal-title flex-center--y">发送</div>
        </template>
        <template #menu>
          <div class="y-game-room__modal-content">
            <div
              class="y-game-room__modal-content-item"
              v-throttle-click:1000="sendMessage.bind(null, '说：快准备！')"
            >
              快准备！
            </div>
            <div
              class="y-game-room__modal-content-item"
              v-throttle-click:1000="sendMessage.bind(null, '说：时间不多咯')"
            >
              时间不多咯
            </div>
            <div
              v-if="state.isOwner"
              class="y-game-room__modal-content-item"
              v-throttle-click:1000="sendMessage.bind(null, '说：要踢人咯')"
            >
              要踢人咯
            </div>
            <div
              class="flex-center"
              v-if="state.saySomething"
              v-throttle-click:1000="sendMessage.bind(null, '说：' + state.saySomething)"
            >
              <YButton size="small">直接发送</YButton>
            </div>
          </div>
        </template>
      </YDropDown>
    </div>
    <div class="y-game-room__btn flex-center--y-between">
      <div class="flex-center--y-between">
        <YButton
          :theme="state.youIsReady ? 'secondary' : 'default'"
          @click="ready"
          :disable="state.isStart"
          >{{ state.youIsReady ? '取消准备' : '准备' }}</YButton
        >
        <Tooltip content="等大伙都准备了就可以开始游戏">
          <YButton
            style="margin-left: 5px"
            :disable="!state.isAllReady || state.isStart"
            v-if="state.isOwner"
            @click="startGame"
          >
            开始游戏
          </YButton>
        </Tooltip>
        <YButton style="margin-left: 5px" @click="shareRoom">分享房间</YButton>
      </div>
      <YButton v-if="state.isOwner" :disable="state.isStart" @click="closeRoom">关闭房间</YButton>
      <YButton v-else :disable="state.isStart" @click="exitRoom">退出房间</YButton>
    </div>
  </YDraggable>
  <main class="y-game-room">
    <!--    <div style="font-size: 28px; font-weight: bold; margin-bottom: 20px">-->
    <!--      功能还差一点哦，再等等~-->
    <!--    </div>-->
    <div class="y-game-room__setting">
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
  <YModal
    :show="state.showResult"
    class-name="y-game-room__result-modal"
    @close="state.showResult = false"
    @confirm="state.showResult = false"
    :z-index="10"
  >
    <template #header>
      <h3>本局结算</h3>
    </template>
    <template #body>
      <table class="y-game-room__table gray-08">
        <caption>
          结算数据
        </caption>
        <thead>
          <tr>
            <th scope="col">玩家</th>
            <th scope="col">准确率</th>
            <th scope="col">字符数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, key) in recordResultComp" :key="key">
            <th scope="row">
              <span>{{ key }}</span>
              <span class="y-game-room__label" v-if="key === routerName">你</span>
            </th>
            <td :class="item.isAccuracyLargest ? 'main-color' : ''">{{ item.accuracy }}</td>
            <td :class="item.isLenLargest ? 'main-color' : ''">{{ item.len }}</td>
          </tr>
        </tbody>
      </table>
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
.y-game-room__online-list {
  //.y-game-room__remove {
  //  display: none;
  //}
  //&:hover {
  //  .y-game-room__remove {
  //    display: block;
  //  }
  //}
}
.y-game-room__online-loading {
}
.y-game-room__say {
  margin: 10px 0;
  border-top: 1px solid $gray-04;
  border-bottom: 1px solid $gray-04;
  padding: 5px 0;
  .y-drop-down__menu {
    top: auto;
    bottom: 26px;
  }
}

.y-game-room__modal-title {
  cursor: pointer;
  padding: 2px;
  font-size: 14px;
  border-radius: 2px;
  background: $gray-02;
  transition: all 0.2s;
  color: $gray-06;
  svg {
    transition: all 0.2s;
    fill: $gray-06;
    width: 18px;
    height: 18px;
    margin-right: 4px;
  }
  &:hover {
    background: $main-color;
    color: $label-white;
    svg {
      fill: $label-white;
    }
  }
}
.y-game-room__modal-content {
  white-space: nowrap;
  font-size: 14px;
  border: 1px solid $gray-02;
  border-radius: 2px;
}
.y-game-room__modal-content-item {
  cursor: pointer;
  border-radius: 2px;
  padding: 4px 10px;
  display: block;
  transition: all 0.2s;
  color: inherit;
  &:hover {
    background-color: $main-color;
    color: $label-white;
  }
  &.y-game-room__modal-content-item--active {
    background-color: $main-color;
    color: $label-white;
  }
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

.y-game-room__result-modal {
  width: 400px;
  .y-modal__body {
    margin-bottom: 0;
  }
}
.y-game-room__table {
  border-collapse: collapse;
  border: 2px solid $gray-06;
  width: 100%;
  caption {
    caption-side: bottom;
    padding: 10px;
    font-weight: bold;
  }
  thead,
  tfoot {
  }
  thead th {
    white-space: nowrap;
  }
  th,
  td {
    border: 1px solid rgb(160 160 160);
    padding: 8px 10px;
  }
}

.limit-line-1 {
  @include limit-line(1);
}
</style>
