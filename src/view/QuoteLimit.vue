<script setup lang="ts">
import { reactive, nextTick, ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// components
import WordInput from '@/components/WordInput.vue';
import DetailModal from '@/components/DetailModal.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import ResultContent from '@/components/ResultContent.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';

// svg
import IcoChange from '@/assets/svg/change.svg';

// config
import { KEY_CODE_ENUM } from '@/config/key';
import type { TypingRecordType } from '@/types';

// common
import { handleChart } from '@/common/chart';

const { t } = useI18n();
const wordInputRef = ref<any>(null);
const wordInputShortRef = ref<any>(null);
const detailModalRef = ref<any>(null);
const useConfig = useConfigStore();
const { currentFont, onlyShowMain, isEscape } = storeToRefs(useConfig);
const quoteLength = [5, 10];
const typeList = computed(() => [
  {
    type: 'short',
    name: t('short_sentence')
  },
  {
    type: 'medium',
    name: t('medium_sentence')
  },
  {
    type: 'long',
    name: t('long_sentence')
  }
]);

const state = reactive({
  typingChartSpeed: [] as number[],
  lastTypingChartSpeed: [] as number[],
  typingChartAccuracy: [] as number[],
  lastTypingChartAccuracy: [] as number[],
  quotes: null as any, // [] 或 {}
  isTyping: false,
  isSpaceType: false,
  intervalId: null as null | number,
  lastIndex: -1,
  len: 5,
  type: 'medium' as 'short' | 'long' | 'medium',
  time: 0 as number,
  showTime: true,
  showResult: false,
  typingRecord: {} as TypingRecordType,
  typingRecordArr: [] as TypingRecordType[],
  currentIndex: 0 // 当前显示的句子的索引
});

state.quotes = getRandom();

onMounted(async () => {
  await nextTick();
  wordInputRef.value?.focusInput();
});

onUnmounted(() => {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
});

watch(
  () => isEscape.value,
  (val) => {
    if (val && state.isTyping) {
      finished();
    }
  }
);

watch(
  () => state.isTyping,
  (val) => {
    if (val) {
      state.time = 0;
      state.intervalId = setInterval(() => {
        state.time += 0.1;
      }, 100);
    } else {
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
      wordInputRef.value?.typingEnd();
    }
  }
);

const timeFormat = computed(() => {
  const time = Number(state.time.toFixed(1));
  if (time && time % 1 === 0) {
    return time + '.0';
  } else {
    return time;
  }
});

async function refresh() {
  state.isTyping = false;
  state.time = 0;
  state.quotes = null;
  state.currentIndex = 0;
  state.typingRecordArr = [];
  await nextTick();
  state.quotes = getRandom();
}

function getRandom() {
  const array = Object.values(Sentence[state.type]);
  if (state.type === 'short') {
    if (array.length < state.len) {
      throw new Error('The array length should be at least 5');
    }

    // 创建一个包含原数组所有索引的数组
    const indices = Array.from({ length: array.length }, (_, i) => i);

    // 使用 Fisher-Yates 洗牌算法打乱索引数组
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // 选取前 length 个随机索引，并从原数组中获取对应元素
    return indices.slice(0, state.len).map((index) => array[index]);
  } else {
    if (array.length === 0) {
      return null;
    }
    if (array.length === 1) {
      return array[0];
    }

    let randomIndex: number = state.lastIndex;

    while (randomIndex === state.lastIndex) {
      randomIndex = Math.floor(Math.random() * array.length);
    }

    state.lastIndex = randomIndex;
    return array[randomIndex];
  }
}
function isTypingFunc() {
  state.isTyping = true;
}
function selectLen(len: number) {
  state.len = len;
  refresh();
}
function selectType(type: any) {
  state.type = type;
  refresh();
}
function keyDownEvent(e: any) {
  if (e.code === KEY_CODE_ENUM['ENTER']) {
    next();
  }
  // if (e.code === KEY_CODE_ENUM['BACKSPACE']) {
  //   if (state.currentIndex > 0) {
  //     state.currentIndex -= 1;
  //   }
  // }
}
function finished() {
  state.isTyping = false;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.showResult = true;
  if (state.type === 'short') {
    state.typingRecordArr.push(wordInputShortRef.value?.getTypingRecord());
  } else {
    state.typingRecord = wordInputRef.value?.getTypingRecord();

    // 处理图表数据
    const typingChartRecord = wordInputRef.value?.getTypingChartRecord();
    const currentTitle = state.quotes.title;
    const { typingChartSpeed, lastTypingChartSpeed, typingChartAccuracy, lastTypingChartAccuracy } =
      handleChart(typingChartRecord, currentTitle);

    state.typingChartSpeed = typingChartSpeed;
    state.lastTypingChartSpeed = lastTypingChartSpeed;
    state.typingChartAccuracy = typingChartAccuracy;
    state.lastTypingChartAccuracy = lastTypingChartAccuracy;
  }
}

function next() {
  if (state.currentIndex >= state.len - 1) {
    finished();
    return;
  }
  state.typingRecordArr.push(wordInputShortRef.value?.getTypingRecord());
  if (state.currentIndex < state.quotes.length - 1) {
    state.currentIndex += 1;
  }
}

function restart() {
  state.isTyping = false;
  state.time = 0;
  state.showResult = false;
  state.currentIndex = 0;
}

async function changePunctuation() {
  if (state.isTyping) {
    refresh();
  }
  await nextTick();
  state.isSpaceType = !state.isSpaceType;
}
</script>
<template>
  <main :class="'y-font--' + currentFont" class="y-quote-limit">
    <div v-if="!state.showResult" class="y-typing-stage">
      <div class="y-quote-limit__setting-wrap">
        <div
          v-if="state.showTime"
          class="y-typing-timer"
          :class="{ 'is-active': !!timeFormat }"
        >
          {{ timeFormat || 0 }}
        </div>
        <div
          class="y-quote-limit__setting y-typing-setting"
        >
          <Transition name="menu">
            <div v-show="!onlyShowMain" class="y-typing-toolbar">
              <div
                class="y-typing-chip"
                :class="{ 'is-active': state.showTime }"
                @click="state.showTime = !state.showTime"
              >
                {{ $t('display_timer') }}
              </div>
              <div
                v-if="state.type !== 'short'"
                class="y-typing-chip"
                :class="{ 'is-active': state.isSpaceType }"
                @click="changePunctuation"
              >
                {{ state.isSpaceType ? $t('space_to_punctuation') : $t('punctuation_to_space') }}
              </div>
              <div class="y-typing-icon" @click="refresh">
                <Tooltip :content="$t('refresh')">
                  <IcoChange></IcoChange>
                </Tooltip>
              </div>
              <span class="y-typing-toolbar__divider"></span>
              <Tooltip content="选择句子类型">
                <span
                  v-for="item in typeList"
                  :key="item.type"
                  class="y-typing-chip"
                  :class="{ 'is-active': state.type === item.type }"
                  @click="selectType(item.type)"
                  >{{ item.name }}</span
                >
              </Tooltip>
              <template v-if="state.type === 'short'">
                <span class="y-typing-toolbar__divider"></span>
                <Tooltip content="选择数量">
                <span
                  v-for="item in quoteLength"
                  :key="item"
                  class="y-typing-chip"
                  :class="{ 'is-active': state.len === item }"
                  @click="selectLen(item)"
                  >{{ item }}</span
                >
              </Tooltip>
              </template>
            </div>
          </Transition>
        </div>
      </div>
      <template v-if="state.type === 'short'">
        <WordInput
          v-if="state.quotes && state.quotes[state.currentIndex]"
          :quote="state.quotes[state.currentIndex]?.content"
          :show-mask="false"
          ref="wordInputShortRef"
          @is-typing="isTypingFunc"
          @is-finished="next"
          @keydown-event="keyDownEvent"
        ></WordInput>
        <div class="y-quote-limit__content gray-04">
          <p
            v-for="(item, index) in state.quotes"
            :class="{ 'gray-08': index === state.currentIndex }"
            :key="item.title"
          >
            {{ item?.content }}
          </p>
        </div>
      </template>
      <template v-else>
        <WordInput
          ref="wordInputRef"
          v-if="state.quotes"
          :is-space-type="state.isSpaceType"
          :quote="state.quotes?.content"
          @is-typing="isTypingFunc"
          @is-finished="finished"
          class-name="y-quote-limit__word-input"
        ></WordInput>
        <div class="y-quote-limit__info y-quote-meta">
          ——
          <span class="y-quote-limit__info-title">
            {{ state.quotes?.title }}
          </span>
          -
          <span class="y-quote-limit__info-author">
            {{ state.quotes?.author }}
          </span>
        </div>
        <Transition name="menu">
          <div
            v-show="!onlyShowMain"
            class="y-quote-limit__detail y-quote-more"
            @click="detailModalRef?.setShowDetail()"
          >
            {{ $t('view_full') }}
          </div>
        </Transition>
        <DetailModal ref="detailModalRef" :quote="state.quotes"></DetailModal>
      </template>
      <Transition name="menu">
        <div v-show="!onlyShowMain" class="y-quote-limit__tips y-typing-tips">
          <p>*{{ $t('sentence.word_tip') }}</p>
          <p v-if="state.type === 'short'">*短句模式下回车则会切换到下一条。</p>
        </div>
      </Transition>
    </div>
    <template v-else>
      <ResultContent
        type="countdown"
        :show-save-record="true"
        :typing-record="state.typingRecord"
        :typing-record-arr="state.typingRecordArr"
        @restart="restart"
        :total-time="state.time"
        :is-positive="true"
        :chart-speed="state.typingChartSpeed"
        :last-chart-speed="state.lastTypingChartSpeed"
        :chart-accuracy="state.typingChartAccuracy"
        :last-chart-accuracy="state.lastTypingChartAccuracy"
      ></ResultContent>
    </template>
  </main>
</template>
<style lang="scss">
.y-quote-limit {
  .y-word-input {
    width: 100%;
  }
}
.y-quote-limit__setting-wrap {
  position: relative;
}
.y-quote-limit__word-input.y-word-input__wrap {
  height: 280px;
  .y-word-input {
    height: 280px;
  }
}
.y-quote-limit__content {
  margin-top: 24px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.8;
  p + p {
    margin-top: 8px;
  }
}
</style>
