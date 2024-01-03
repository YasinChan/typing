<script setup lang="ts">
import { reactive, nextTick } from 'vue';

// components
import WordInput from '@/components/WordInput.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';
import IcoChange from '@/assets/svg/change.svg';
import Tooltip from '@/components/ui/Tooltip.vue';

// config
import { KEY_CODE_ENUM } from '@/config/key';

const useConfig = useConfigStore();
const { currentFont, onlyShowMain } = storeToRefs(useConfig);
const quoteLength = [5, 10];

const state = reactive({
  quotes: [] as any,
  lastIndex: -1,
  len: 5,
  time: null,
  currentIndex: 0 // 当前显示的句子的索引
});
state.quotes = getRandomArr();

async function refresh() {
  state.quotes = [];
  await nextTick();
  state.quotes = getRandomArr();
}

function getRandomArr() {
  const array = Object.values(Sentence.short);
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
}
function selectLen(len: number) {
  state.len = len;
  refresh();
}
function keyDownEvent(e: any) {
  if (e.code === KEY_CODE_ENUM['ENTER']) {
    if (state.currentIndex < state.quotes.length - 1) {
      state.currentIndex += 1;
    }
  }
  if (e.code === KEY_CODE_ENUM['BACKSPACE']) {
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
    }
  }
}
</script>
<template>
  <main :class="'y-font--' + currentFont" class="y-quote-limit">
    <div class="y-quote-limit__setting">
      <div v-if="state.time !== null" class="y-quote-limit__time">
        {{ state.time }}
      </div>
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
    <WordInput
      v-if="state.quotes[state.currentIndex]"
      :quote="state.quotes[state.currentIndex]?.content"
      :show-mask="false"
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
  </main>
</template>
<style lang="scss">
.y-quote-limit {
  .y-word-input {
    width: 100%;
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
.y-quote-limit__setting {
  position: relative;
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
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
</style>
