<script setup lang="ts">
const props = defineProps({
  disable: {
    type: Boolean,
    default: false
  },
  form: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium'
  },
  theme: {
    type: String,
    default: 'default'
  }
});
const emitter = defineEmits(['click']);

const handlerClick = () => {
  if (props.disable) {
    return;
  }
  emitter('click');
};
</script>

<template>
  <button
    v-throttle-click:1000="handlerClick"
    :disabled="disable"
    :form="form"
    class="y-button"
    :class="[
      disable ? 'y-button--disabled' : '',
      size === 'small' ? 'y-button--small' : '',
      size === 'large' ? 'y-button--large' : '',
      theme === 'default' ? '' : 'y-button--' + theme
    ]"
  >
    <slot>按钮</slot>
  </button>
</template>

<style lang="scss">
.y-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: $radius-md;
  color: $label-white;
  background: $main-color;
  box-shadow: $shadow-sm;
  transition: transform 0.2s $ease-out, box-shadow 0.2s $ease-out, background-color 0.2s $ease-out,
    color 0.2s $ease-out, opacity 0.2s $ease-out;
  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: $shadow-sm;
  }
}
.y-button--small {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: $radius-sm;
}
.y-button--large {
  padding: 10px 18px;
  font-size: 16px;
}
.y-button--disabled {
  cursor: not-allowed;
  opacity: 0.35 !important;
  box-shadow: none;
  transform: none !important;
  &:hover {
    opacity: 0.35 !important;
    transform: none !important;
    box-shadow: none;
  }
}
.y-button--secondary {
  background: transparent;
  color: $main-color;
  box-shadow: inset 0 0 0 1px $main-color;
  &:hover {
    background: $main-color;
    color: $label-white;
    box-shadow: $shadow-sm;
  }
}
</style>
