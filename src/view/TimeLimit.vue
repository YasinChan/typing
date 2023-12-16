<script setup lang="ts">
// components
import YPinyin from '@/components/Pinyin.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Sentence.json';

const useConfig = useConfigStore();

const { currentFont } = storeToRefs(useConfig);
</script>
<template>
  <main :class="'y-font--' + currentFont">
    <!--    <y-pinyin :words="Sentence.content"></y-pinyin>-->
    <div class="y-time-limit">{{ Sentence.content }}</div>
    <!--    <textarea type="text" />-->
  </main>
</template>
<style lang="scss">
.y-time-limit {
  line-height: 60px;
}
textarea {
  touch-action: manipulation;
  -webkit-appearance: none;
  box-sizing: border-box;
  margin: 0;
  list-style: none;
  position: relative;
  display: inline-block;
  width: 100%;
  padding: 4px 11px;
  color: $gray-08;
  background-color: transparent;
  background-image: none;
  border: none;
  border-bottom: 1px solid $gray-06;
  transition: all 0.3s;
  outline: 0;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 1px;
  &:hover,
  &:focus {
    border-color: $main-color-hover;
  }
}
</style>
