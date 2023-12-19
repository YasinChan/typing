<script setup lang="ts">
import { reactive } from 'vue';
// @ts-ignore
import flatten from 'lodash/flatten';

// components
import WordInput from '@/components/WordInput.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';

const useConfig = useConfigStore();
const { currentFont } = storeToRefs(useConfig);

const state = reactive({
  quote: {} as any,
  lastIndex: -1
});
state.quote = getRandomNonRepeatingElement(Object.values(Sentence));

function refresh() {
  state.quote = getRandomNonRepeatingElement(Object.values(Sentence));
}

function getRandomNonRepeatingElement(arr: any[]) {
  arr = flatten(arr);
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
</script>
<template>
  <main :class="'y-font--' + currentFont">
    <div class="y-quote-limit__refresh" @click="refresh">随机</div>

    <WordInput :quote="state.quote?.content"></WordInput>

    <div class="y-quote-limit__info">
      ——
      <span class="y-quote-limit__info-title">
        {{ state.quote?.title }}
      </span>
      -
      <span class="y-quote-limit__info-author">
        {{ state.quote?.author }}
      </span>
    </div>
  </main>
</template>
<style lang="scss">
.y-quote-limit__refresh {
  cursor: pointer;
}
.y-quote-limit__info {
  margin-top: 30px;
  text-align: right;
  color: $gray-02;
}
</style>
