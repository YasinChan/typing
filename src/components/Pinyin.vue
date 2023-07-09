<script setup lang="ts">
import { reactive } from 'vue';
import { pinyin } from 'pinyin-pro';

const props = defineProps({
  words: {
    default: '',
    type: String,
  },
})

const state = reactive({
  wordsPinyin: [] as any,
})

state.wordsPinyin = pinyin(props.words, { type: 'array', toneType: 'none' });

</script>

<template>
  <div class="y-pinyin">
    <div class="y-pinyin__words">{{ words }}</div>
    
    <div class="y-pinyin__words-pinyin">
      <template v-for="item in state.wordsPinyin">
        {{ item }}
      </template>  
    </div>
  </div>
</template>

<style lang="scss">

</style>
