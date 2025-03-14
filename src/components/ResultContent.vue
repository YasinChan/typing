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
</script>
<template>
  <div class="y-result-content__info flex-center">
    <div class="result-content flex-center" :content="state.accuracyInfo">
      {{ $t('accuracy') }}:&nbsp;<span class="result-content--main-color">{{
        state.accuracy
      }}</span>
      <Tooltip class="cursor-pointer result-content__tips" :content="state.accuracyInfo">
        <IcoTips></IcoTips>
      </Tooltip>
    </div>
    <div class="result-content flex-center">
      {{ $t('speed') }}:&nbsp;<span class="result-content--main-color">{{ state.speed }}</span>
      <Tooltip
        class="cursor-pointer result-content__tips"
        :content="$t('sentence.leaderboard_rule1')"
      >
        <IcoTips></IcoTips>
      </Tooltip>
    </div>
    <div class="result-content flex-center">
      {{ $t('duration') }}:&nbsp;
      <span class="result-content--main-color">{{ totalTime.toFixed(1) }}</span
      >&nbsp;{{ $t('sec') }}
    </div>
  </div>
  <Chart
    v-if="chartAccuracy && chartAccuracy.length"
    class="y-result-content__chart"
    :current-data="chartAccuracy"
    :last-data="lastChartAccuracy"
    :y-name="$t('accuracy_unit')"
    :title="$t('accuracy_curve')"
  ></Chart>
  <Chart
    v-if="chartSpeed && chartSpeed.length"
    :current-data="chartSpeed"
    :last-data="lastChartSpeed"
    :y-name="$t('speed_unit')"
    :title="$t('speed_curve')"
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
  margin-bottom: 40px;
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
    fill: $label-white;
    cursor: pointer;
    margin-right: 4px;
  }
  margin: 0 20px;
}
.result-content {
  font-size: 20px;
  color: $gray-06;
  margin: 0 20px;
  svg {
    width: 18px;
    height: 18px;
    fill: $gray-04;
    margin-left: 6px;
    margin-top: 2px;
  }
}
.result-content--main-color {
  color: $main-color;
}
.result-content__toolbar {
  margin-top: 60px;
}
.result-content__replay {
  line-height: 28px;
  margin-top: 60px;
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
  &.result-content__speed-again {
    left: 150px;
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
  li {
    margin-left: 20px;
  }
}
</style>
