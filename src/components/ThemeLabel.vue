<script lang="ts" setup>
defineProps<{
  backgroundColor: string;
  labelBackgroundColor: string;
  redColor: string;
  grayColor: string;
  mainColor: string;
}>();
</script>

<template>
  <div class="theme-label" :style="{ background: backgroundColor }">
    <span :style="{ background: labelBackgroundColor }"></span>
    <span :style="{ background: redColor }"></span>
    <span :style="{ background: grayColor }"></span>
    <span :style="{ background: mainColor }"></span>
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
