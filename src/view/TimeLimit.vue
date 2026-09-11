<script setup lang="ts">
import { reactive, watch, ref, onUnmounted, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// components
import WordInput from '@/components/WordInput.vue';
import YModal from '@/components/ui/Modal.vue';
import ResultContent from '@/components/ResultContent.vue';
import TypingChip from '@/components/typing/TypingChip.vue';
import TypingToolbar, {
  TypingChipGroup,
  TypingToolbarDivider
} from '@/components/typing/TypingToolbar.vue';
import TypingToolbarIcon from '@/components/typing/TypingToolbarIcon.vue';
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
import IcoSelect from '@/assets/svg/select.svg';
import IcoUnSelect from '@/assets/svg/un-select.svg';
import YInput from '@/components/ui/Input.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import { handleChart } from '@/common/chart';
import { getRandomNonRepeatingElement } from '@/utils/common';

const router = useRouter();

const wordInputRef = ref<any>(null);
const detailModalRef = ref<any>(null);
const useConfig = useConfigStore();
const { currentFont, isEscape } = storeToRefs(useConfig);
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

function finishTyping() {
  if (!state.isTyping && !state.showResult) return;
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  wordInputRef.value?.typingEnd();
  state.typingRecord = wordInputRef.value?.getTypingRecord() || {};
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
  state.isTyping = false;
  state.showResult = true;
}

watch(
  () => isEscape.value,
  (val) => {
    if (val && state.isTyping) finishTyping();
  }
);

watch(
  () => state.isTyping,
  (val) => {
    if (val && state.selectTime) {
      state.countDown = state.selectTime;
      state.intervalId = setInterval(() => {
        // console.log(`剩余时间：${state.countDown} 秒`);

        if (state.countDown) {
          state.countDown -= 1;
          if (state.countDown < 1) finishTyping();
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
  nextTick(() => wordInputRef.value?.focusInput());
}

function selectTime(time: number) {
  state.selectTime = time;
  state.isTyping = false;
  if (id) {
    state.quote = Sentence.long.find((item) => item.id === Number(id));
  } else {
    state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));
  }
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
  // @ts-ignore
  if (!/\d+/.test(Number(state.setCountDown))) {
    state.errorText = '请输入数字';
    return;
  }
  state.isTyping = false;
  if (id) {
    state.quote = Sentence.long.find((item) => item.id === Number(id));
  } else {
    state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));
  }
  state.showSetTime = false;
  state.selectTime = Number(state.setCountDown);
  nextTick(() => wordInputRef.value?.focusInput());
}
function restart() {
  state.isTyping = false;
  state.showResult = false;
}

function changePunctuation() {
  // 与英文标点开关一致：同一篇就地切换，不换文、不重开计时
  state.isSpaceType = !state.isSpaceType;
  if (state.isTyping) state.isTyping = false;
  nextTick(() => wordInputRef.value?.focusInput());
}

function reset() {
  router.push('/');
  refresh();
}
</script>
<template>
  <main class="y-time-limit" :class="'y-font--' + currentFont">
    <div v-if="!state.showResult" class="y-typing-stage">
      <div class="y-time-limit__setting y-typing-setting">
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
            <TypingChip :active="!state.isSpaceType" @click="changePunctuation">
              @ {{ $t('punctuation') }}
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
              </TypingChipGroup>
            </Tooltip>
            <TypingToolbarDivider />
            <TypingToolbarIcon @click="refresh">
              <Tooltip :content="$t('refresh')">
                <IcoChange></IcoChange>
              </Tooltip>
            </TypingToolbarIcon>
            <TypingChip
              v-if="router.currentRoute?.value?.query?.id"
              @click="reset"
            >
              {{ $t('reset') }}
            </TypingChip>
            <YDropDown>
              <template #title>
                <Tooltip :content="$t('settings')">
                  <TypingToolbarIcon :active="!customTime.includes(state.selectTime)">
                    <IcoSetting></IcoSetting>
                  </TypingToolbarIcon>
                </Tooltip>
              </template>
              <template #menu>
                <div class="y-time-limit__settings-menu">
                  <div
                    class="y-time-limit__settings-item"
                    @click="state.showCountDown = !state.showCountDown"
                  >
                    <component :is="state.showCountDown ? IcoSelect : IcoUnSelect" />
                    <span>{{ $t('display_countdown') }}</span>
                  </div>
                  <div class="y-time-limit__settings-item" @click="state.showSetTime = true">
                    <span>{{ $t('custom_countdown') }}</span>
                  </div>
                </div>
              </template>
            </YDropDown>
        </TypingToolbar>
      </div>
      <WordInput
        ref="wordInputRef"
        :is-space-type="state.isSpaceType"
        :quote="state.quote?.content"
        @is-typing="isTypingFunc"
        @refresh="refresh"
      ></WordInput>
      <div class="y-time-limit__info y-quote-meta">
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
        <div class="y-time-limit__detail y-quote-more">
          <span @click="detailModalRef?.setShowDetail()">{{ $t('view_full') }}</span>
        </div>
      </Transition>
      <div class="y-typing-tips">
        <p>*{{ $t('sentence.word_tip') }}</p>
      </div>
    </div>
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
.y-time-limit__settings-menu {
  min-width: 180px;
  padding: 4px 0;
  font-size: 14px;
}
.y-time-limit__settings-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: $radius-sm;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s $ease-out, color 0.15s $ease-out;
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  &:hover {
    background: $background-gray;
    color: $gray-08;
  }
}
.time-limit__container {
  color: $gray-04;
  font-size: 14px;
}
</style>
