<script lang="ts" setup>
defineProps<{
  text: string;
}>();
</script>
<template>
  <div class="y-tag">
    <slot name="icon"></slot>
    <span class="y-tag-text">{{ text }}</span>
  </div>
</template>
<style lang="scss" scoped>
.y-tag {
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  border-radius: 4px;
  line-height: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  transform: scale(0.8) translate(-4px, 0);
  background-color: $main-color;
  margin-right: 2px;
}
</style>
