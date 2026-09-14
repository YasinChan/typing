<script setup lang="ts">
/** 工具栏选项按钮，字号和间距由 TypingToolbar 统一约束 */
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
  <div class="y-typing-chip" :class="{ 'is-active': active }">
    <slot />
  </div>
</template>
