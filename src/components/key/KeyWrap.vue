<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive } from 'vue';

import { CAN_PRINT_KEY } from '@/config/key';
import { useConfigStore } from '@/store/config';

const configStore = useConfigStore();

defineProps({
  title: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
});
const state = reactive({
  currentCode: '',
  keysPressed: {} as any
});
const handleKeyDown = (e: KeyboardEvent) => {
  e.preventDefault();
  const code = e.code;

  const capsLockOn = e.getModifierState('CapsLock');
  if (capsLockOn && CAN_PRINT_KEY[code]) {
    configStore.setPrintContent(CAN_PRINT_KEY[code].toUpperCase() || '');
  } else {
    configStore.setPrintContent(CAN_PRINT_KEY[code] || '');
  }

  if (code === 'Enter') {
    configStore.setPrintContent('<br/>');
  }
  if (code === 'Backspace') {
    configStore.minusPrintContent();
  }

  if (!state.keysPressed[code]) {
    console.log('----------', 'handleKeyDown', e, '----------cyy log');
    configStore.setCurrentCode(e.code);
    state.keysPressed[code] = true;
    state.currentCode = code;
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  console.log('----------', 'handleKeyUp', e, '----------cyy log');
  state.keysPressed[e.code] = false;
  state.currentCode = '';
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
  <div class="y-key-wrap" :class="className">
    <slot :keys-pressed="state.keysPressed"></slot>
  </div>
  <div class="y-key-wrap__title">{{ title }}</div>
</template>
<style lang="scss">
.y-key-wrap {
  display: flex;
  justify-content: space-between;
}
.y-key-wrap__title {
  text-align: center;
  color: $gray-04;
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
}
</style>
