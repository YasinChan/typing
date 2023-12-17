<script setup lang="ts">
import { reactive } from 'vue';
// components
import YPinyin from '@/components/Pinyin.vue';
import WordInput from '@/components/WordInput.vue';

import { getRandomNonRepeatingElement } from '@/utils/common';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Sentence.json';

const useConfig = useConfigStore();

const { currentFont } = storeToRefs(useConfig);

const state = reactive({
  sentence: {} as any
});
state.sentence = getRandomNonRepeatingElement(Sentence);
function refresh() {
  state.sentence = getRandomNonRepeatingElement(Sentence);
}
</script>
<template>
  <main :class="'y-font--' + currentFont">
    <!--    <y-pinyin :words="Sentence.content"></y-pinyin>-->
    <div class="y-time-limit__refresh" @click="refresh">刷新</div>
    <WordInput :sentence="state.sentence?.content"></WordInput>
  </main>
</template>
<style lang="scss">
.y-time-limit__refresh {
  cursor: pointer;
}
</style>
