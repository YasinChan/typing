<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive } from 'vue';

const state = reactive({
  isKeyPressed: false
});
const handleKeyDown = (e: KeyboardEvent) => {
  if (!state.isKeyPressed) {
    state.isKeyPressed = true;
    // 在这里处理按键按下时的事件
    console.log('handleKeyDown', e);
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  state.isKeyPressed = false;
  console.log('handleKeyUp', e);
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
});
</script>
<template>
  <div class="y-key-wrap">
    <slot :is-key-pressed="state.isKeyPressed"></slot>
  </div>
</template>
