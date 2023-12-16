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
  font-size: 16px;
  line-height: 20px;
  margin: 8px 0;
  transition: color 0.3s;
  &:hover {
    color: $main-color-hover;
  }
}
</style>
