<script lang="ts" setup>
const emit = defineEmits(['click']);
</script>
<template>
  <div class="y-list-item" @click="emit('click', $event)">
    <slot></slot>
  </div>
</template>
<style lang="scss">
.y-list-item {
  cursor: pointer;
  font-size: 15px;
  line-height: 22px;
  margin: 4px 0;
  padding: 8px 10px;
  border-radius: $radius-sm;
  transition: color 0.2s $ease-out, background-color 0.2s $ease-out;
  &:hover {
    color: $main-color;
    background: $background-gray;
  }
}
</style>
