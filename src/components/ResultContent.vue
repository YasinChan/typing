<script lang="ts" setup>
import { reactive, computed, onMounted, onUnmounted, inject } from 'vue';
import { useI18n } from 'vue-i18n';

// components
import Tooltip from '@/components/ui/Tooltip.vue';
import YButton from '@/components/ui/Button.vue';
import Chart from '@/components/chart/Chart.vue';

// types
import type { TypingRecordType, TypingRecordItemType } from '@/types';

// apis
import { saveLeaderBoard } from '@/request';

// svg
import IcoReplay from '@/assets/svg/replay.svg';
import IcoChange from '@/assets/svg/change.svg';
import IcoSpeedUp from '@/assets/svg/speed-up.svg';
import IcoRecord from '@/assets/svg/record.svg';
import IcoTips from '@/assets/svg/tips.svg';

// stores
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';

const { t } = useI18n();
const userStore = useUserStore();
const { profile, getProvinceUser } = storeToRefs(userStore);

const confirm: any = inject('confirm');
const message: any = inject('message');
const props = defineProps<{
  typingRecord?: TypingRecordType;
  typingRecordArr?: TypingRecordType[];
  totalTime: number;
  isPositive?: boolean; // 是否是正向计时
  type?: string;
  showSaveRecord?: boolean;
  chartSpeed?: number[];
  lastChartSpeed?: number[];
  chartAccuracy?: number[];
  lastChartAccuracy?: number[];
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
  playRatio: 1,
  hadRecord: false
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
          state.totalWord += item.word?.length ? item.word.replace(/\s+/g, '').length : 0;
          state.wrongWord += item.wrongPos?.length ? item.wrongPos?.length : 0;
        }
      });
    }
  }
  state.accuracy = !state.totalWord
    ? '0%'
    : (((state.totalWord - state.wrongWord) / state.totalWord) * 100).toFixed(0) + '%';
  state.accuracyInfo = `${state.totalWord - state.wrongWord} 字正确 / ${state.wrongWord} 字错误`;
  state.speedInfo = props.totalTime
    ? (((state.totalWord - state.wrongWord) / props.totalTime) * 60).toFixed(0)
    : '';
  state.speed = state.speedInfo ? state.speedInfo + (' ' + t('wpm')) : '';
});

onUnmounted(() => {
  state.hadRecord = false;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.timeoutArray.forEach((timeout) => {
    clearTimeout(timeout);
  });
  state.timeoutArray = [];
});

const replyName = computed(() => {
  if (profile.value?.userName) {
    return profile.value.userName;
  } else if (getProvinceUser.value) {
    return getProvinceUser.value;
  }
  return '';
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

async function record() {
  if (state.hadRecord) {
    return;
  }
  if (Number(state.accuracy.replace('%', '')) >= 80 && props.totalTime >= 15) {
    confirm({
      title: '确认保存',
      content: '确认将会将该条记录保存到排行榜中。',
      confirmClose: () => {
        return true;
      },
      confirm: async () => {
        try {
          const res = await saveLeaderBoard({
            accuracy: state.accuracy,
            duration: Math.round(props.totalTime),
            type: props.type,
            userId: profile.value?.userId,
            userName: replyName.value,
            wpm: Number(state.speedInfo)
          });
          message({ message: res.data?.message });
          // emit('restart');
          state.hadRecord = true;
        } catch (error: any) {
          const msg = error.response?.data?.message;
          message({ message: msg, type: 'error' });
        }
        return true;
      }
    });
    return;
  }
  confirm({
    title: '不符合记录条件',
    content: '可以记录的条件为时长大于 15 秒，同时准确率大于 80%。',
    confirmClose: () => {
      return true;
    },
    confirm: () => {
      return true;
    }
  });
}

const getTypingContentAtTime = (time: number) => {
  if (!props.typingRecord) return '';
  // 从当前时间往前找，直到找到有输入内容的记录
  for (let t = time * 10; t >= 0; t--) {
    if (props.typingRecord[t]) {
      const record = props.typingRecord[t];
      const typingContent = record
        .filter(item => item.isInput)
        .map(item => {
          if (item.wrongPos && item.wrongPos.length > 0) {
            const chars = item.word?.split('') || [];
            return chars.map((char, index) => 
              item.wrongPos?.includes(index) ? 
                `<span style="color: #ff4d4f">${char}</span>` : 
                char
            ).join('');
          }
          return item.word;
        })
        .join('');
      if (typingContent) {
        return typingContent;
      }
    }
  }
  return '';
};
function buildTooltipFormatter(unit: string) {
  return (params: any[]) => {
    const time = params[0].dataIndex;
    const lines = [`${time} ${t('sec')}`];
    params.forEach((p) => lines.push(`${p.seriesName}: ${p.value}${unit}`));
    const typingContent = getTypingContentAtTime(time);
    if (typingContent) {
      lines.push(`${t('typing_content')}: ${typingContent}`);
    }
    return lines.join('<br/>');
  };
}
const accuracyTooltipFormatter = buildTooltipFormatter('%');
const speedTooltipFormatter = buildTooltipFormatter(` ${t('wpm')}`);
</script>
<template>
  <div class="y-result-content__info flex-center">
    <div class="y-result-stat">
      <div class="y-result-stat__label">{{ $t('accuracy') }}</div>
      <div class="y-result-stat__value">{{ state.accuracy }}</div>
      <Tooltip class="cursor-pointer y-result-stat__tips" :content="state.accuracyInfo">
        <IcoTips></IcoTips>
      </Tooltip>
    </div>
    <div class="y-result-stat">
      <div class="y-result-stat__label">{{ $t('speed') }}</div>
      <div class="y-result-stat__value">{{ state.speed || '—' }}</div>
      <Tooltip class="cursor-pointer y-result-stat__tips" :content="$t('sentence.leaderboard_rule1')">
        <IcoTips></IcoTips>
      </Tooltip>
    </div>
    <div class="y-result-stat">
      <div class="y-result-stat__label">{{ $t('duration') }}</div>
      <div class="y-result-stat__value">{{ totalTime.toFixed(1) }}<span class="y-result-stat__unit">{{ $t('sec') }}</span></div>
    </div>
  </div>
  <Chart
    v-if="chartAccuracy && chartAccuracy.length"
    class="y-result-content__chart"
    :current-data="chartAccuracy"
    :last-data="lastChartAccuracy"
    :y-name="$t('accuracy_unit')"
    :title="$t('accuracy_curve')"
    :tooltip-formatter="accuracyTooltipFormatter"
  ></Chart>
  <Chart
    v-if="chartSpeed && chartSpeed.length"
    :current-data="chartSpeed"
    :last-data="lastChartSpeed"
    :y-name="$t('speed_unit')"
    :title="$t('speed_curve')"
    :tooltip-formatter="speedTooltipFormatter"
  ></Chart>
  <div class="result-content__toolbar flex-center">
    <YButton class="result-content__svg" size="large" @click="restart"
      ><IcoChange></IcoChange> {{ $t('restart') }}</YButton
    >
    <YButton class="result-content__svg" v-if="!isShort" size="large" @click="replay"
      ><IcoReplay></IcoReplay> {{ $t('review_playback') }}</YButton
    >
    <Tooltip
      v-if="showSaveRecord"
      class="result-content__svg"
      :class="[state.hadRecord ? 'result-content__svg--disabled' : '']"
      :content="state.hadRecord ? '记录已保存' : '保存本次记录，将会在排行榜中展示。'"
    >
      <YButton class="flex-center--y" :disable="state.hadRecord" size="large" @click="record"
        ><IcoRecord></IcoRecord> {{ $t('save_records') }}</YButton
      >
    </Tooltip>
  </div>
  <div class="result-content__replay" v-if="state.currentOperation">
    <div v-if="timeFormat !== null" class="result-content__count-down">
      {{ timeFormat }}
    </div>
    <div class="result-content__speed-up flex-center--y">
      <Tooltip content="快进">
        <IcoSpeedUp @click="speedUp"></IcoSpeedUp>
      </Tooltip>
      <span class="result-content__speed-up-ratio">{{ state.playRatio }} 倍速</span>
    </div>
    <div class="result-content__speed-again result-content__speed-up flex-center--y">
      <Tooltip content="重播">
        <IcoChange @click="replay"></IcoChange>
      </Tooltip>
      <span class="result-content__speed-up-ratio">重播</span>
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
  <div class="y-result-content__bottom">
    *{{ $t('reminder') }}：
    <ol>
      <li>{{ $t('sentence.reminder1') }}</li>
      <li>{{ $t('sentence.reminder2') }}</li>
      <li>{{ $t('sentence.reminder3') }}</li>
    </ol>
  </div>
</template>
<style lang="scss">
.y-result-content__info {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}
.y-result-stat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 20px 22px 18px;
  background: $layout-background-gray;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}
.y-result-stat__label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: $gray-06;
}
.y-result-stat__value {
  color: $main-color;
  font-size: 36px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  line-height: 1.1;
}
.y-result-stat__unit {
  margin-left: 6px;
  font-size: 14px;
  color: $gray-06;
  font-weight: 600;
  letter-spacing: 0;
}
.y-result-stat__tips {
  position: absolute;
  top: 16px;
  right: 16px;
  svg {
    width: 16px;
    height: 16px;
    fill: $gray-04;
  }
}
.result-content__svg {
  &.result-content__svg--disabled {
    svg {
      cursor: not-allowed;
    }
  }
  display: flex;
  align-items: center;
  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
    cursor: pointer;
  }
  margin: 0 8px;
}
.result-content__toolbar {
  margin-top: 48px;
  gap: 8px;
}
.result-content__replay {
  line-height: 28px;
  margin-top: 60px;
  position: relative;
  padding: 48px 20px 20px;
  background: $layout-background-gray;
  border-radius: $radius-lg;
}
.result-content__replay-item--underline {
  text-decoration: underline;
}
.result-content__count-down {
  position: absolute;
  top: 16px;
  left: 20px;
  color: $main-color;
  font-size: 22px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
}
.result-content__speed-up {
  user-select: none;
  position: absolute;
  top: 18px;
  left: 84px;
  color: $gray-04;
  font-size: 14px;
  font-weight: bold;
  svg {
    width: 22px;
    height: 22px;
    fill: $gray-06;
    cursor: pointer;
    &:hover,
    &:active {
      fill: $main-color;
    }
  }
  .result-content__speed-up-ratio {
    margin-left: 4px;
  }
  &.result-content__speed-again {
    left: 180px;
  }
}
.result-content__replay-item {
  word-wrap: break-word;
  .wrong {
    color: $main-red;
  }
}
.y-result-content__chart {
  margin-bottom: 40px;
}

.y-result-content__bottom {
  margin: 50px 0 20px;
  font-size: 14px;
  color: $gray-04;
  font-weight: 400;
  letter-spacing: 0;
  li {
    margin-left: 20px;
  }
}
</style>
