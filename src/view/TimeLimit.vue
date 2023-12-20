<script setup lang="ts">
import { reactive, watch } from 'vue';

// components
import WordInput from '@/components/WordInput.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';

// svg
import IcoSetting from '@/assets/svg/setting.svg';
import IcoChange from '@/assets/svg/change.svg';

const useConfig = useConfigStore();
const { currentFont, onlyShowMain } = storeToRefs(useConfig);
const customTime = [15, 30, 60, 120];

const state = reactive({
  quote: {} as any,
  lastIndex: -1,
  selectTime: 30 as number,
  countDown: null as null | number,
  isTyping: false,
  intervalId: null as null | number
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
            }
          }
        }
      }, 1000);
    } else {
      state.countDown = null;
      if (state.intervalId !== null) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
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
</script>
<template>
  <main :class="'y-font--' + currentFont">
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
          <IcoChange></IcoChange>
        </div>
      </Transition>
      <Transition name="menu">
        <div v-show="!onlyShowMain" class="y-time-limit__setting-item y-time-limit__time">
          <span
            v-for="item in customTime"
            :key="item"
            class="y-time-limit__time-item"
            :class="{ 'y-time-limit__time-item--active': state.selectTime === item }"
            @click="selectTime(item)"
            >{{ item }}</span
          >
          <IcoSetting class="y-time-limit__time-svg"></IcoSetting>
        </div>
      </Transition>
    </div>

    <WordInput :quote="state.quote?.content" @is-typing="isTyping"></WordInput>

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
  </main>
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
}
.y-time-limit__time-item--active {
  color: $main-color;
}
.y-time-limit__time-svg {
  width: 18px;
  height: 18px;
  fill: $gray-06;
  cursor: pointer;
}
.y-time-limit__refresh {
  cursor: pointer;
  height: 18px;
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
</style>
