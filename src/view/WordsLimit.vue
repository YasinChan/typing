<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import EnglishWordInput from '@/components/EnglishWordInput.vue';
import ResultContent from '@/components/ResultContent.vue';
import TypingChip from '@/components/typing/TypingChip.vue';
import TypingToolbar, {
  TypingChipGroup,
  TypingToolbarDivider
} from '@/components/typing/TypingToolbar.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import YInput from '@/components/ui/Input.vue';
import YModal from '@/components/ui/Modal.vue';

import { handleChart } from '@/common/chart';
import { useConfigStore } from '@/store/config';
import type { TypingRecordType } from '@/types';

import IcoChange from '@/assets/svg/change.svg';

const wordInputRef = ref<any>(null);
const { currentFont } = storeToRefs(useConfigStore());
const customTime = [15, 30, 60, 120];

const state = reactive({
  punctuation: true,
  selectTime: 30 as number,
  setCountDown: '' as string,
  errorText: '',
  showSetTime: false,
  showCountDown: true,
  countDown: null as null | number,
  intervalId: null as null | number,
  isTyping: false,
  showResult: false,
  usedTime: 30,
  typingRecord: {} as TypingRecordType,
  typingChartSpeed: [] as number[],
  lastTypingChartSpeed: [] as number[],
  typingChartAccuracy: [] as number[],
  lastTypingChartAccuracy: [] as number[]
});

function chartKey() {
  return `english-${state.selectTime}-${state.punctuation ? 'p' : ''}`;
}

function finishTyping() {
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  if (!state.isTyping && !state.showResult) return;
  // 先收记录再切结果页，避免输入组件卸载后拿不到回放数据
  wordInputRef.value?.typingEnd();
  state.typingRecord = wordInputRef.value?.getTypingRecord() || {};
  const typingChartRecord = wordInputRef.value?.getTypingChartRecord();
  const { typingChartSpeed, lastTypingChartSpeed, typingChartAccuracy, lastTypingChartAccuracy } =
    handleChart(typingChartRecord, chartKey());
  state.typingChartSpeed = typingChartSpeed;
  state.lastTypingChartSpeed = lastTypingChartSpeed;
  state.typingChartAccuracy = typingChartAccuracy;
  state.lastTypingChartAccuracy = lastTypingChartAccuracy;
  const remain = state.countDown;
  state.usedTime = remain == null ? state.selectTime : Math.max(state.selectTime - remain, 1);
  state.isTyping = false;
  state.showResult = true;
}

function refresh() {
  state.isTyping = false;
  state.showResult = false;
  state.countDown = null;
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  wordInputRef.value?.resetWords();
  nextTick(() => wordInputRef.value?.focusInput());
}

function selectTime(time: number) {
  state.selectTime = time;
  state.isTyping = false;
  state.countDown = null;
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  nextTick(() => wordInputRef.value?.focusInput());
}

function openCustomTime() {
  state.setCountDown = String(state.selectTime);
  state.errorText = '';
  state.showSetTime = true;
}

function togglePunctuation() {
  // 不走 refresh：不换篇、不重开计时，只让同一篇按新开关重分词
  state.punctuation = !state.punctuation;
  nextTick(() => wordInputRef.value?.focusInput());
}

function isTypingFunc() {
  state.isTyping = true;
}

function setTime() {
  if (!state.setCountDown) {
    state.showSetTime = false;
    return;
  }
  if (!/^\d+$/.test(state.setCountDown)) {
    state.errorText = '请输入数字';
    return;
  }
  state.selectTime = Number(state.setCountDown);
  state.showSetTime = false;
  state.isTyping = false;
  nextTick(() => wordInputRef.value?.focusInput());
}

function restart() {
  refresh();
}

watch(
  () => state.setCountDown,
  () => {
    if (state.setCountDown && !/^\d+$/.test(state.setCountDown)) {
      state.errorText = '请输入数字';
    } else {
      state.errorText = '';
    }
  }
);

watch(
  () => state.isTyping,
  (val) => {
    if (val && state.selectTime) {
      state.countDown = state.selectTime;
      state.intervalId = window.setInterval(() => {
        if (state.countDown) {
          state.countDown -= 1;
          if (state.countDown < 1) {
            finishTyping();
          }
        }
      }, 1000);
    } else if (state.intervalId !== null) {
      state.countDown = null;
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }
);

onMounted(() => {
  nextTick(() => wordInputRef.value?.focusInput());
});

onUnmounted(() => {
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
});
</script>

<template>
  <main class="y-words-limit" :class="'y-font--' + currentFont">
    <div v-if="!state.showResult" class="y-typing-stage">
      <div class="y-words-limit__setting y-typing-setting">
        <div
          v-if="(state.countDown || state.selectTime) && state.showCountDown"
          class="y-typing-timer"
          :class="{
            'is-active': !!state.countDown,
            'is-urgent': !!state.countDown && state.countDown <= 5
          }"
        >
          {{ state.countDown || state.selectTime }}
        </div>
        <TypingToolbar>
          <TypingChip :active="state.punctuation" @click="togglePunctuation">
            @ {{ $t('punctuation') }}
          </TypingChip>
          <TypingChip class="y-source-refresh" @click="refresh">
            <IcoChange></IcoChange>
            {{ $t('change_passage') }}
          </TypingChip>
          <TypingToolbarDivider />
          <Tooltip :content="$t('select_countdown')">
            <TypingChipGroup>
              <TypingChip
                v-for="item in customTime"
                :key="item"
                :active="state.selectTime === item"
                @click="selectTime(item)"
              >
                {{ item }}
              </TypingChip>
              <TypingChip
                :active="!customTime.includes(state.selectTime)"
                :title="$t('custom_countdown')"
                @click="openCustomTime"
              >
                {{
                  customTime.includes(state.selectTime) ? $t('custom_time') : `${state.selectTime}s`
                }}
              </TypingChip>
            </TypingChipGroup>
          </Tooltip>
          <TypingToolbarDivider />
          <TypingChip
            :active="state.showCountDown"
            :title="$t('display_countdown')"
            @click="state.showCountDown = !state.showCountDown"
          >
            {{ $t('display_countdown') }}
          </TypingChip>
        </TypingToolbar>
      </div>
      <EnglishWordInput
        ref="wordInputRef"
        :punctuation="state.punctuation"
        @is-typing="isTypingFunc"
        @is-finished="finishTyping"
        @refresh="refresh"
      />
      <div class="y-typing-tips">
        <p>*{{ $t('sentence.word_tip') }} {{ $t('sentence.english_tip') }}</p>
      </div>
    </div>
    <ResultContent
      v-else
      type="english"
      :show-save-record="false"
      :typing-record="state.typingRecord"
      :total-time="state.usedTime"
      :is-positive="false"
      :chars-per-word="5"
      :chart-speed="state.typingChartSpeed"
      :last-chart-speed="state.lastTypingChartSpeed"
      :chart-accuracy="state.typingChartAccuracy"
      :last-chart-accuracy="state.lastTypingChartAccuracy"
      @restart="restart"
    />
  </main>
  <YModal :show="state.showSetTime" @close="state.showSetTime = false" @confirm="setTime">
    <template #header>
      <h3>{{ $t('custom_countdown') }}</h3>
    </template>
    <template #body>
      <div class="time-limit__container">
        <YInput
          v-model="state.setCountDown"
          :error-text="state.errorText"
          :placeholder="$t('enter_countdown')"
        ></YInput>
      </div>
    </template>
  </YModal>
</template>

<style lang="scss">
.time-limit__container {
  color: $gray-06;
  font-size: 14px;
}
</style>
