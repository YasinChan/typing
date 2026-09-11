<script setup lang="ts">
/** 工具栏图标按钮，尺寸和 chip 对齐 */
withDefaults(
  defineProps<{
    active?: boolean;
  }>(),
  {
    active: false
  }
);
</script>

<template>
  <div class="y-typing-icon" :class="{ 'is-active': active }">
    <slot />
  </div>
</template>
