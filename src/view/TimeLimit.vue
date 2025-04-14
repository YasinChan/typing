<script setup lang="ts">
import { reactive, watch, ref, onUnmounted, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// components
import WordInput from '@/components/WordInput.vue';
import YModal from '@/components/ui/Modal.vue';
import ResultContent from '@/components/ResultContent.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import DetailModal from '@/components/DetailModal.vue';

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
import { handleChart } from '@/common/chart';

const router = useRouter();

const wordInputRef = ref<any>(null);
const detailModalRef = ref<any>(null);
const useConfig = useConfigStore();
const { currentFont, onlyShowMain } = storeToRefs(useConfig);
const customTime = [15, 30, 60, 120];

const state = reactive({
  typingChartSpeed: [] as number[],
  lastTypingChartSpeed: [] as number[],
  typingChartAccuracy: [] as number[],
  lastTypingChartAccuracy: [] as number[],
  showDetail: false,
  showSetTime: false,
  isSpaceType: false,
  quote: {} as any,
  lastIndex: -1,
  selectTime: 15 as number, // 设置的倒计时
  showCountDown: true,
  countDown: null as null | number, // 实时倒计时
  errorText: '',
  setCountDown: '' as any, // 自定义的倒计时
  isTyping: false,
  intervalId: null as null | number,
  showResult: false,
  typingRecord: {} as TypingRecordType
});

const id = router.currentRoute?.value?.query?.id;

if (id) {
  state.quote = Sentence.long.find((item) => item.id === Number(id));
} else {
  state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));
}

onMounted(async () => {
  await nextTick();
  wordInputRef.value?.focusInput();
});

onUnmounted(() => {
  state.countDown = null;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
});

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
              wordInputRef.value?.typingEnd();

              // 处理图表数据
              const typingChartRecord = wordInputRef.value?.getTypingChartRecord();
              const currentTitle = state.quote.title;
              const {
                typingChartSpeed,
                lastTypingChartSpeed,
                typingChartAccuracy,
                lastTypingChartAccuracy
              } = handleChart(typingChartRecord, currentTitle);

              state.typingChartSpeed = typingChartSpeed;
              state.lastTypingChartSpeed = lastTypingChartSpeed;
              state.typingChartAccuracy = typingChartAccuracy;
              state.lastTypingChartAccuracy = lastTypingChartAccuracy;

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
  state.isTyping = false;
  if (id) {
    state.quote = Sentence.long.find((item) => item.id === Number(id));
  } else {
    state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));
  }
}

function isTypingFunc() {
  state.isTyping = true;
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
  state.selectTime = Number(state.setCountDown);
}
function restart() {
  state.isTyping = false;
  state.showResult = false;
}

async function changePunctuation() {
  if (state.isTyping) {
    refresh();
  }
  await nextTick();
  state.isSpaceType = !state.isSpaceType;
}

function reset() {
  router.push('/');
  refresh();
}
</script>
<template>
  <main class="y-time-limit" :class="'y-font--' + currentFont">
    <template v-if="!state.showResult">
      <div class="y-time-limit__setting">
        <div
          v-if="(state.countDown || state.selectTime) && state.showCountDown"
          class="y-time-limit__count-down"
          :class="[state.countDown ? 'y-time-limit__count-down--active' : '']"
        >
          {{ state.countDown || state.selectTime }}
        </div>
        <Transition name="menu">
          <div
            v-show="!onlyShowMain"
            class="y-time-limit__setting-item y-time-limit__set-time"
            :class="[state.showCountDown ? 'y-time-limit__time--active' : '']"
            @click="state.showCountDown = !state.showCountDown"
          >
            {{ $t('display_countdown') }}
          </div>
        </Transition>
        <Transition name="menu">
          <div
            v-show="!onlyShowMain"
            class="y-time-limit__setting-item y-time-limit__set-time"
            @click="changePunctuation"
          >
            {{ state.isSpaceType ? $t('space_to_punctuation') : $t('punctuation_to_space') }}
          </div>
        </Transition>
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
            <Tooltip :content="$t('select_countdown')">
              <span
                v-for="item in customTime"
                :key="item"
                class="y-time-limit__time-item"
                :class="{ 'y-time-limit__time-item--active': state.selectTime === item }"
                @click="selectTime(item)"
                >{{ item }}</span
              >
            </Tooltip>
            <Tooltip class="y-time-limit__time-svg" :content="$t('custom_countdown')">
              <IcoSetting
                :class="{
                  'y-time-limit__time-item--active': !customTime.includes(state.selectTime)
                }"
                @click="state.showSetTime = true"
              ></IcoSetting>
            </Tooltip>
            <div
              class="y-time-limit__time-item"
              v-if="router.currentRoute?.value?.query?.id"
              style="cursor: pointer; white-space: nowrap; margin-left: 10px"
              @click="reset"
            >
              {{ $t('reset') }}
            </div>
          </div>
        </Transition>
      </div>
      <WordInput
        ref="wordInputRef"
        :is-space-type="state.isSpaceType"
        :quote="state.quote?.content"
        @is-typing="isTypingFunc"
      ></WordInput>
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
      <Transition name="menu">
        <div v-show="!onlyShowMain" class="y-time-limit__detail">
          <span @click="detailModalRef?.setShowDetail()">{{ $t('view_full') }}</span>
        </div>
      </Transition>
    </template>
    <template v-else>
      <ResultContent
        type="time"
        :show-save-record="true"
        :typing-record="state.typingRecord"
        @restart="restart"
        :total-time="state.selectTime"
        :is-positive="false"
        :chart-speed="state.typingChartSpeed"
        :last-chart-speed="state.lastTypingChartSpeed"
        :chart-accuracy="state.typingChartAccuracy"
        :last-chart-accuracy="state.lastTypingChartAccuracy"
      ></ResultContent>
    </template>
  </main>
  <YModal :show="state.showSetTime" @close="state.showSetTime = false" @confirm="setTime">
    <template #header>
      <h3>{{ $t('custom_countdown') }}</h3>
    </template>
    <template #body>
      <div class="time-limit__container">
        <YInput
          :error-text="state.errorText"
          class="time-limit__q"
          v-model="state.setCountDown"
          :placeholder="$t('enter_countdown')"
        ></YInput>
      </div>
    </template>
  </YModal>
  <DetailModal ref="detailModalRef" :quote="state.quote"></DetailModal>
</template>
<style lang="scss">
.y-time-limit {
  .y-word-input__wrap,
  .y-word-input {
    height: 280px;
  }
}
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
  color: $gray-04;
  font-size: 22px;
  font-weight: bold;
  &.y-time-limit__count-down--active {
    color: $main-color;
  }
}
.y-time-limit__set-time {
  display: inline-flex;
  align-items: center;
  color: $gray-04;
  font-size: 14px;
  line-height: 24px;
  height: 24px;
  cursor: pointer;
  transition: color 0.2s ease;
  &:hover {
    color: $main-color;
  }
  &.y-time-limit__time--active {
    color: $main-color;
  }
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
    color: $main-color;
  }
}
.y-time-limit__time-item--active {
  color: $main-color;
  fill: $main-color !important;
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
  color: $gray-04;
}
.y-time-limit__detail {
  text-align: right;
  color: $gray-04;
  font-size: 14px;
  font-weight: normal;
  margin-top: 20px;
  span {
    cursor: pointer;
  }
}
.time-limit__container {
  color: $gray-04;
  font-size: 14px;
}
.time-limit__remind {
  padding-bottom: 10px;
}
</style>
