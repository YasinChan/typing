<script setup lang="ts">
import { reactive, nextTick, ref, watch, onUnmounted, computed } from 'vue';

// components
import WordInput from '@/components/WordInput.vue';
import DetailModal from '@/components/DetailModal.vue';
import Tooltip from '@/components/ui/Tooltip.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';

// svg
import IcoChange from '@/assets/svg/change.svg';
import IcoTips from '@/assets/svg/tips.svg';

// config
import { KEY_CODE_ENUM } from '@/config/key';
import type { TypingRecordType } from '@/types';
import ResultContent from '@/components/ResultContent.vue';

const wordInputRef = ref<any>(null);
const wordInputShortRef = ref<any>(null);
const detailModalRef = ref<any>(null);
const useConfig = useConfigStore();
const { currentFont, onlyShowMain, isEscape } = storeToRefs(useConfig);
const quoteLength = [5, 10];
const typeList = [
  {
    type: 'short',
    name: '短句'
  },
  {
    type: 'medium',
    name: '中句'
  },
  {
    type: 'long',
    name: '长句'
  }
];

const state = reactive({
  quotes: null as any, // [] 或 {}
  isTyping: false,
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
</script>
<template>
  <main :class="'y-font--' + currentFont" class="y-quote-limit">
    <template v-if="!state.showResult">
      <div class="y-quote-limit__setting-wrap">
        <div
          v-if="state.showTime"
          class="y-quote-limit__start"
          :class="[timeFormat ? 'y-quote-limit__start--active' : '']"
        >
          {{ timeFormat || 0 }}
        </div>
        <div
          class="y-quote-limit__setting"
          :class="state.type !== 'short' ? 'y-quote-limit__setting--disabled' : ''"
        >
          <Transition name="menu">
            <div
              v-show="!onlyShowMain"
              class="y-quote-limit__setting-item y-quote-limit__set-time"
              :class="[state.showTime ? 'y-quote-limit__time--active' : '']"
              @click="state.showTime = !state.showTime"
            >
              显示计时
            </div>
          </Transition>
          <Transition name="menu">
            <div
              v-show="!onlyShowMain"
              class="y-quote-limit__setting-item y-quote-limit__refresh"
              @click="refresh"
            >
              <Tooltip class="y-quote-limit__time-svg" content="刷新">
                <IcoChange></IcoChange>
              </Tooltip>
            </div>
          </Transition>
          <Transition name="menu">
            <div v-show="!onlyShowMain" class="y-quote-limit__setting-item y-quote-limit__time">
              <Tooltip content="选择句子类型">
                <span
                  v-for="item in typeList"
                  :key="item.type"
                  class="y-quote-limit__time-item"
                  :class="{ 'y-quote-limit__time-item--active': state.type === item.type }"
                  @click="selectType(item.type)"
                  >{{ item.name }}</span
                >
              </Tooltip>
            </div>
          </Transition>
          <Transition name="menu">
            <div v-show="!onlyShowMain" class="y-quote-limit__setting-item y-quote-limit__time">
              <Tooltip content="选择数量">
                <span
                  v-for="item in quoteLength"
                  :key="item"
                  class="y-quote-limit__time-item"
                  :class="{ 'y-quote-limit__time-item--active': state.len === item }"
                  @click="selectLen(item)"
                  >{{ item }}</span
                >
              </Tooltip>
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
          :quote="state.quotes?.content"
          @is-typing="isTypingFunc"
          @is-finished="finished"
          class-name="y-quote-limit__word-input"
        ></WordInput>
        <div class="y-quote-limit__info">
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
            class="y-quote-limit__detail"
            @click="detailModalRef?.setShowDetail()"
          >
            查看全文
          </div>
        </Transition>
        <DetailModal ref="detailModalRef" :quote="state.quotes"></DetailModal>
      </template>
      <Transition name="menu">
        <div v-show="!onlyShowMain" class="y-quote-limit__tips">
          <p>*键入过程中，按下键盘左上角 Esc 键可随时结束输入进度。</p>
          <p v-if="state.type === 'short'">*短句模式下回车则会切换到下一条。</p>
        </div>
      </Transition>
    </template>
    <template v-else>
      <ResultContent
        type="countdown"
        :show-save-record="true"
        :typing-record="state.typingRecord"
        :typing-record-arr="state.typingRecordArr"
        @restart="restart"
        :total-time="state.time"
        :is-positive="true"
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
.y-quote-limit__set-time {
  display: inline-flex;
  align-items: center;
  color: $gray-04;
  font-size: 14px;
  line-height: 24px;
  height: 24px;
  cursor: pointer;
  &.y-quote-limit__time--active {
    color: $main-color;
  }
}
.y-quote-limit__refresh {
  cursor: pointer;
}
.y-quote-limit__info {
  margin-top: 30px;
  text-align: right;
  color: $gray-02;
}
.y-quote-limit__setting-wrap {
  position: relative;
  overflow: hidden;
  padding-top: 50px;
  margin-top: -50px;
}
.y-quote-limit__setting {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
  transition: transform 0.2s ease;
}
.y-quote-limit__setting--disabled {
  transform: translateX(110px);
}
.y-quote-limit__setting-item:not(:last-child) {
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
.y-quote-limit__start {
  position: absolute;
  top: 50px;
  left: 0;
  color: $gray-04;
  font-size: 22px;
  font-weight: bold;
  &.y-quote-limit__start--active {
    color: $main-color;
  }
}
.y-quote-limit__time-svg {
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
.y-quote-limit__time {
  display: inline-flex;
  align-items: center;
  color: $gray-06;
  font-size: 16px;
  line-height: 24px;
  height: 24px;
}
.y-quote-limit__time-item {
  margin-right: 10px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  word-break: keep-all;
}
.y-quote-limit__time-item--active {
  color: $main-color;
}
.y-quote-limit__word-input.y-word-input__wrap {
  height: 280px;
  .y-word-input {
    height: 280px;
  }
}
.y-quote-limit__info {
  margin-top: 30px;
  text-align: right;
  color: $gray-02;
}
.y-quote-limit__detail {
  text-align: right;
  color: $gray-02;
  font-size: 14px;
  font-weight: normal;
  margin-top: 20px;
  cursor: pointer;
}
.y-quote-limit__tips {
  margin-top: 60px;
  color: $gray-02;
  font-size: 16px;
  line-height: 30px;
  height: 24px;
  text-align: center;
}
</style>
