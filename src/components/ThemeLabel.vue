<script lang="ts" setup>
import { computed } from 'vue';

// types
import type { COLOR_TYPE } from '@/types';

const props = defineProps<
  Partial<{
    customThemeObj: COLOR_TYPE | undefined;
    backgroundColor: string;
    labelBackgroundColor: string;
    redColor: string;
    grayColor: string;
    mainColor: string;
  }>
>();

const backgroundColorC = computed(() => {
  if (props.customThemeObj) {
    return props.customThemeObj['BACKGROUND_COLOR'];
  }
  return props.backgroundColor;
});

const labelBackgroundColorC = computed(() => {
  if (props.customThemeObj) {
    return props.customThemeObj['LAYOUT_BACKGROUND_COLOR'];
  }
  return props.labelBackgroundColor;
});

const redColorC = computed(() => {
  if (props.customThemeObj) {
    return props.customThemeObj['MAIN_RED'];
  }
  return props.redColor;
});

const grayColorC = computed(() => {
  if (props.customThemeObj) {
    return props.customThemeObj['GRAY_08'];
  }
  return props.grayColor;
});

const mainColorC = computed(() => {
  if (props.customThemeObj) {
    return props.customThemeObj['MAIN_COLOR'];
  }
  return props.mainColor;
});
</script>

<template>
  <div class="theme-label" :style="{ background: backgroundColorC }">
    <span :style="{ background: labelBackgroundColorC }"></span>
    <span :style="{ background: redColorC }"></span>
    <span :style="{ background: grayColorC }"></span>
    <span :style="{ background: mainColorC }"></span>
  </div>
</template>

<style lang="scss">
.theme-label {
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  height: 24px;

  span {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.4);
    margin: 4px;
  }
}
</style>
