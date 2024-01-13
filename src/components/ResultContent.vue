<script lang="ts" setup>
import { reactive, computed, onMounted, onUnmounted } from 'vue';

// components
import Tooltip from '@/components/ui/Tooltip.vue';

// types
import type { TypingRecordType, TypingRecordItemType } from '@/types';

// svg
import IcoReplay from '@/assets/svg/replay.svg';
import IcoChange from '@/assets/svg/change.svg';
import IcoSpeedUp from '@/assets/svg/speed-up.svg';

const props = defineProps<{
  typingRecord?: TypingRecordType;
  typingRecordArr?: TypingRecordType[];
  totalTime: number;
  isPositive?: boolean; // 是否是正向计时
}>();
const emit = defineEmits(['restart']);
const state = reactive({
  currentTime: 0,
  currentOperation: null as TypingRecordItemType[] | null,
  timeoutArray: [] as number[],
  intervalId: null as null | number,
  currentRecordTime: 0 as any,
  totalWord: 0,
  wrongWord: 0,
  accuracy: '',
  accuracyInfo: '' as string,
  speed: '',
  speedInfo: '' as string,
  playRatio: 1
});

const keys = computed(() => {
  if (props.typingRecord) {
    return Object.keys(props.typingRecord)
      .map(Number)
      .sort((a, b) => a - b); // 按键值排序
  } else {
    return [];
  }
});

const isShort = computed(() => {
  // 是否是短句模式
  return props.typingRecordArr && props.typingRecordArr.length > 0;
});

onMounted(() => {
  if (props.typingRecordArr && props.typingRecordArr.length > 0) {
    // 短句模式下特别处理
    for (let i = 0; i < props.typingRecordArr.length; i++) {
      const keys = Object.keys(props.typingRecordArr[i])
        .map(Number)
        .sort((a, b) => a - b);
      const lastRecord: TypingRecordItemType[] = props.typingRecordArr[i]
        ? props.typingRecordArr[i][keys[keys.length - 1]]
        : [];
      if (lastRecord.length > 0) {
        lastRecord.forEach((item) => {
          if (item.isInput) {
            state.totalWord += item.word?.length ? item.word?.length : 0;
            state.wrongWord += item.wrongPos?.length ? item.wrongPos?.length : 0;
          }
        });
      }
    }
  } else {
    const lastRecord: TypingRecordItemType[] = props.typingRecord
      ? props.typingRecord[keys.value[keys.value.length - 1]]
      : [];
    if (lastRecord.length > 0) {
      lastRecord.forEach((item) => {
        if (item.isInput) {
          state.totalWord += item.word?.length ? item.word?.length : 0;
          state.wrongWord += item.wrongPos?.length ? item.wrongPos?.length : 0;
        }
      });
    }
  }
  state.accuracy = (((state.totalWord - state.wrongWord) / state.totalWord) * 100).toFixed(0) + '%';
  state.accuracyInfo = `${state.totalWord - state.wrongWord} 字正确 / ${state.wrongWord} 字错误`;
  state.speed = props.totalTime
    ? (((state.totalWord - state.wrongWord) / props.totalTime) * 60).toFixed(0) + ' 字/分钟'
    : '';
});

onUnmounted(() => {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.timeoutArray.forEach((timeout) => {
    clearTimeout(timeout);
  });
  state.timeoutArray = [];
});

function replay() {
  // 查看回放
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.playRatio = 1;
  state.timeoutArray.forEach((timeout) => {
    clearTimeout(timeout);
  });
  state.timeoutArray = [];
  state.currentTime = new Date().getTime();
  executeTimeline();
  if (props.isPositive) {
    keepTime();
  } else {
    countDown();
  }
}
function executeTimeline() {
  // 执行记录的时间轴
  if (!props.typingRecord) {
    return;
  }

  let currentIndex = 0;

  function executeStep() {
    if (!props.typingRecord) {
      return;
    }
    const currentTime = keys.value[currentIndex];
    state.currentOperation = props.typingRecord[currentTime];

    currentIndex++;

    if (currentIndex < keys.value.length) {
      const nextTime = keys.value[currentIndex];
      const delay = nextTime - currentTime;
      const timeout = setTimeout(executeStep, (delay * 100) / state.playRatio); // 延时执行下一个操作
      state.timeoutArray.push(timeout);
    }
  }

  executeStep(); // 开始执行时间轴
}

function countDown(refresh = false) {
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  if (!refresh) {
    state.currentRecordTime = props.totalTime || 0;
  }
  state.intervalId = setInterval(() => {
    if (state.currentRecordTime) {
      state.currentRecordTime -= 0.1 * state.playRatio;
      if (state.currentRecordTime < 0.1 * state.playRatio) {
        if (state.intervalId !== null) {
          state.currentRecordTime = 0;
          clearInterval(state.intervalId);
          state.intervalId = null;
        }
      }
    }
  }, 100);
}
function keepTime(refresh = false) {
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  if (!refresh) {
    state.currentRecordTime = 0;
  }
  state.intervalId = setInterval(() => {
    state.currentRecordTime += 0.1 * state.playRatio;

    if (state.currentRecordTime > Number(props.totalTime)) {
      if (state.intervalId !== null) {
        state.currentRecordTime = props.totalTime;
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    }
  }, 100);
}

const timeFormat = computed(() => {
  const time = Number(state.currentRecordTime.toFixed(1));
  if (time % 1 === 0) {
    return time + '.0';
  } else {
    return time;
  }
});

function speedUp() {
  if (state.playRatio === 1) {
    state.playRatio = 1.5;
  } else if (state.playRatio === 1.5) {
    state.playRatio = 2;
  } else if (state.playRatio === 2) {
    state.playRatio = 3;
  } else if (state.playRatio === 3) {
    state.playRatio = 1;
  }
  if (props.isPositive) {
    keepTime(true);
  } else {
    countDown(true);
  }
}

function restart() {
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  emit('restart');
}
</script>
<template>
  <Tooltip class="result-content cursor-pointer" :content="state.accuracyInfo">
    正确率：<span class="result-content--main-color">{{ state.accuracy }}</span>
  </Tooltip>
  <Tooltip
    class="result-content cursor-pointer"
    content="这里的速度的计算规则中是包含了标点符号的。"
  >
    速度：<span class="result-content--main-color">{{ state.speed }}</span>
  </Tooltip>
  <div class="result-content">
    时长：<span class="result-content--main-color">{{ totalTime.toFixed(1) }}</span> 秒
  </div>
  <div class="result-content__toolbar flex-center">
    <Tooltip class="result-content__svg" content="重新开始">
      <IcoChange @click="restart"></IcoChange>
    </Tooltip>
    <Tooltip v-if="!isShort" class="result-content__svg" content="查看回放">
      <IcoReplay @click="replay"></IcoReplay>
    </Tooltip>
  </div>
  <div class="result-content__replay" v-if="state.currentOperation">
    <div v-if="timeFormat !== null" class="result-content__count-down">
      {{ timeFormat }}
    </div>
    <div class="result-content__speed-up flex-center--y">
      <Tooltip content="加速">
        <IcoSpeedUp @click="speedUp"></IcoSpeedUp>
      </Tooltip>
      <span class="result-content__speed-up-ratio">{{ state.playRatio }} 倍速</span>
    </div>
    <span
      class="result-content__replay-item"
      :class="{
        'result-content__replay-item--underline': item.isComposition
      }"
      v-for="(item, index) in state.currentOperation"
      :key="index"
    >
      <span
        v-for="(i, dex) in item.word"
        :class="{ wrong: item.wrongPos?.includes(dex) }"
        :key="index + dex"
        >{{ i }}</span
      >
    </span>
  </div>
</template>
<style lang="scss">
.result-content__svg {
  svg {
    width: 28px;
    height: 28px;
    fill: $gray-06;
    cursor: pointer;
  }
  margin: 0 20px;
}
.result-content {
  font-size: 20px;
  color: $gray-06;
  margin-bottom: 40px;
  text-align: center;
  display: block;
}
.result-content--main-color {
  color: $main-color;
}
.result-content__toolbar {
  margin-top: 60px;
}
.result-content__replay {
  line-height: 28px;
  margin-top: 40px;
  position: relative;
}
.result-content__replay-item--underline {
  text-decoration: underline;
}
.result-content__count-down {
  position: absolute;
  top: -40px;
  left: 0;
  color: $main-color;
  font-size: 22px;
  font-weight: bold;
}
.result-content__speed-up {
  user-select: none;
  position: absolute;
  top: -40px;
  left: 60px;
  color: $gray-04;
  font-size: 14px;
  font-weight: bold;
  svg {
    width: 24px;
    height: 24px;
    fill: $gray-06;
    cursor: pointer;
    &:active {
      fill: $main-color;
    }
  }
  .result-content__speed-up-ratio {
    margin-left: 4px;
  }
}
.result-content__replay-item {
  word-wrap: break-word;
  .wrong {
    color: $main-red;
  }
}
</style>
