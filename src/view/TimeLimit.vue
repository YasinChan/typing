<script setup lang="ts">
import { inject, reactive, watch, ref } from 'vue';

// components
import WordInput from '@/components/WordInput.vue';
import YModal from '@/components/ui/Modal.vue';
import ResultContent from '@/components/ResultContent.vue';
import Tooltip from '@/components/ui/Tooltip.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';

// types
import type { TypingRecordType } from '@/types';

// svg
import IcoSetting from '@/assets/svg/setting.svg';
import IcoChange from '@/assets/svg/change.svg';
import YInput from '@/components/ui/Input.vue';

const message: any = inject('message');
const confirm: any = inject('confirm');
const wordInputRef = ref<any>(null);
const useConfig = useConfigStore();
const { currentFont, onlyShowMain } = storeToRefs(useConfig);
const customTime = [1, 15, 30, 60, 120];

const state = reactive({
  showSetTime: false,
  quote: {} as any,
  lastIndex: -1,
  selectTime: 15 as number, // 设置的倒计时
  countDown: null as null | number, // 实时倒计时
  errorText: '',
  setCountDown: '' as any, // 自定义的倒计时
  isTyping: false,
  intervalId: null as null | number,
  showResult: false,
  typingRecord: {} as TypingRecordType
});
state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));

watch(
  () => state.isTyping,
  (val) => {
    if (val && state.selectTime) {
      state.countDown = state.selectTime;
      state.intervalId = setInterval(() => {
        // console.log(`剩余时间：${state.countDown} 秒`);

        if (state.countDown) {
          state.countDown -= 1;
          if (state.countDown < 1) {
            if (state.intervalId !== null) {
              clearInterval(state.intervalId);
              state.intervalId = null;
              state.showResult = true;
              state.typingRecord = wordInputRef.value?.getTypingRecord();
              // confirm({
              //   title: '时间到',
              //   content: '是否继续？',
              //   confirm: () => {
              //     state.countDown = state.selectTime;
              //   },
              //   confirmText: '继续',
              //   cancelText: '结束',
              //   cancel: () => {
              //     state.countDown = null;
              //     if (state.intervalId !== null) {
              //       clearInterval(state.intervalId);
              //       state.intervalId = null;
              //     }
              //   }
              // });
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

watch(
  () => state.setCountDown,
  () => {
    // @ts-ignore
    if (!/\d+/.test(Number(state.setCountDown))) {
      state.errorText = '请输入数字';
    } else {
      state.errorText = '';
    }
  }
);

function refresh() {
  state.isTyping = false;
  state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));
}

function getRandomNonRepeatingElement(arr: any[]) {
  if (arr.length === 0) {
    return null;
  }
  if (arr.length === 1) {
    return arr[0];
  }

  let randomIndex: number = state.lastIndex;

  while (randomIndex === state.lastIndex) {
    randomIndex = Math.floor(Math.random() * arr.length);
  }

  state.lastIndex = randomIndex;
  return arr[randomIndex];
}

function selectTime(time: number) {
  console.log('选择的时间：', time);
  state.selectTime = time;
  refresh();
}

function isTyping() {
  state.isTyping = true;
}

interface CountdownOptions {
  duration: number;
  onEnd: () => void;
}

interface Countdown {
  stop: () => void;
}

function countdownFunc(options: CountdownOptions): Countdown {
  const { duration, onEnd } = options;

  let remainingTime = duration;
  let intervalId: number | null = null;

  const stopCountdown = (): void => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const countdownInterval = setInterval(() => {
    // console.log(`剩余时间：${remainingTime} 秒`);

    remainingTime -= 1;
    if (remainingTime < 0) {
      stopCountdown();
      onEnd();
    }
  }, 1000);

  intervalId = countdownInterval;

  return {
    stop: stopCountdown
  };
}
function setTime() {
  if (!state.setCountDown) {
    state.showSetTime = false;
    return;
  }
  // @ts-ignore
  if (!/\d+/.test(Number(state.setCountDown))) {
    state.errorText = '请输入数字';
    return;
  }
  refresh();
  state.showSetTime = false;
  state.selectTime = state.setCountDown;
}
function restart() {
  state.isTyping = false;
  state.showResult = false;
}
</script>
<template>
  <main :class="'y-font--' + currentFont">
    <template v-if="!state.showResult">
      <div class="y-time-limit__setting">
        <div v-if="state.countDown !== null" class="y-time-limit__count-down">
          {{ state.countDown }}
        </div>
        <Transition name="menu">
          <div
            v-show="!onlyShowMain"
            class="y-time-limit__setting-item y-time-limit__refresh"
            @click="refresh"
          >
            <Tooltip class="y-time-limit__time-svg" content="刷新">
              <IcoChange></IcoChange>
            </Tooltip>
          </div>
        </Transition>
        <Transition name="menu">
          <div v-show="!onlyShowMain" class="y-time-limit__setting-item y-time-limit__time">
            <Tooltip content="选择倒计时">
              <span
                v-for="item in customTime"
                :key="item"
                class="y-time-limit__time-item"
                :class="{ 'y-time-limit__time-item--active': state.selectTime === item }"
                @click="selectTime(item)"
                >{{ item }}</span
              >
            </Tooltip>
            <Tooltip class="y-time-limit__time-svg" content="自定义倒计时">
              <IcoSetting @click="state.showSetTime = true"></IcoSetting>
            </Tooltip>
          </div>
        </Transition>
      </div>
      <WordInput ref="wordInputRef" :quote="state.quote?.content" @is-typing="isTyping"></WordInput>
      <div class="y-time-limit__info">
        ——
        <span class="y-time-limit__info-title">
          {{ state.quote?.title }}
        </span>
        -
        <span class="y-time-limit__info-author">
          {{ state.quote?.author }}
        </span>
      </div>
    </template>
    <template v-else>
      <ResultContent
        :typing-record="state.typingRecord"
        @restart="restart"
        :select-time="state.selectTime"
      ></ResultContent>
    </template>
  </main>
  <YModal :show="state.showSetTime" @close="state.showSetTime = false" @confirm="setTime">
    <template #header>
      <h3>设置倒计时</h3>
    </template>
    <template #body>
      <div class="time-limit__container">
        <YInput
          :error-text="state.errorText"
          class="time-limit__q"
          v-model="state.setCountDown"
          placeholder="请输入倒计时 单位：秒"
        ></YInput>
      </div>
    </template>
  </YModal>
</template>
<style lang="scss">
.y-time-limit__setting {
  position: relative;
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
}
.y-time-limit__setting-item:not(:last-child) {
  position: relative;
  margin-right: 30px;
  &::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 12px;
    background: $gray-02;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.y-time-limit__count-down {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  color: $main-color;
  font-size: 22px;
  font-weight: bold;
}
.y-time-limit__time {
  display: inline-flex;
  align-items: center;
  color: $gray-06;
  font-size: 16px;
  line-height: 24px;
  height: 24px;
}
.y-time-limit__time-item {
  margin-right: 10px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: $main-color-hover;
  }
}
.y-time-limit__time-item--active {
  color: $main-color;
}
.y-time-limit__time-svg {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 18px;
    height: 18px;
    fill: $gray-06;
    cursor: pointer;
  }
}
.y-time-limit__refresh {
  cursor: pointer;
  margin-right: 20px;
  svg {
    fill: $gray-06;
    width: 18px;
    height: 18px;
  }
}
.y-time-limit__info {
  margin-top: 30px;
  text-align: right;
  color: $gray-02;
}
.time-limit__container {
  color: $gray-04;
  font-size: 14px;
}
.time-limit__remind {
  padding-bottom: 10px;
}
</style>
