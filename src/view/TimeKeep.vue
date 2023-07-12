<script setup lang="ts">
import YPinyin from '@/components/Pinyin.vue';
import { useConfigStore } from '@/store/config';
import { storeToRefs } from 'pinia';
const useConfig = useConfigStore();

const { currentFont } = storeToRefs(useConfig);
</script>
<template>
  <main :class="'y-font--' + currentFont">
    <y-pinyin words="计时模式"></y-pinyin>
  </main>
</template>
