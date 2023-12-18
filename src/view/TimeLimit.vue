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
  quote: {} as any,
  lastIndex: -1
});
state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));

function refresh() {
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
</script>
<template>
  <main :class="'y-font--' + currentFont">
    <div class="y-time-limit__refresh" @click="refresh">随机</div>

    <WordInput :quote="state.quote?.content"></WordInput>

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
