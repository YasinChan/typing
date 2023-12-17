<script setup lang="ts">
import { reactive } from 'vue';

// components
import WordInput from '@/components/WordInput.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Sentence.json';

const useConfig = useConfigStore();
const { currentFont } = storeToRefs(useConfig);

const state = reactive({
  sentence: {} as any,
  lastIndex: -1
});
state.sentence = getRandomNonRepeatingElement(Sentence);

function refresh() {
  state.sentence = getRandomNonRepeatingElement(Sentence);
}

function getRandomNonRepeatingElement<T>(arr: T[]): T | null {
  // 如果数组为空，返回 null 或者适当的值
  if (arr.length === 0) {
    return null;
  }

  // 如果数组中只有一个元素，直接返回该元素
  if (arr.length === 1) {
    return arr[0];
  }

  let randomIndex: number = state.lastIndex;

  // 确保每次随机选择的索引与上次不同
  while (randomIndex === state.lastIndex) {
    randomIndex = Math.floor(Math.random() * arr.length);
  }

  state.lastIndex = randomIndex;
  return arr[randomIndex];
}
</script>
<template>
  <main :class="'y-font--' + currentFont">
    <div class="y-time-limit__refresh" @click="refresh">随机</div>

    <WordInput :sentence="state.sentence?.content"></WordInput>

    <div class="y-time-limit__info">
      ——
      <span class="y-time-limit__info-title">
        {{ state.sentence?.title }}
      </span>
      -
      <span class="y-time-limit__info-author">
        {{ state.sentence?.author }}
      </span>
    </div>
  </main>
</template>
<style lang="scss">
.y-time-limit__refresh {
  cursor: pointer;
}
.y-time-limit__info {
  margin-top: 30px;
  text-align: right;
  color: $gray-02;
}
</style>
