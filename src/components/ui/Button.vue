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
  white-space: nowrap;
  border: none;
  box-shadow: 0 2px #00000004;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 2px;
  color: $label-white;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  background: $main-color;
  &:hover {
    background: $main-color;
  }
}
.y-button--small {
  padding: 4px 10px;
  font-size: 12px;
}
.y-button--large {
  padding: 6px 12px;
  font-size: 16px;
}
.y-button--disabled {
  cursor: not-allowed;
  opacity: 0.3;
  &:hover {
    opacity: 0.3;
  }
}
.y-button--secondary {
  background: $label-white;
  opacity: 0.8;
  color: $main-color;
  &:hover {
    background: $label-white;
    color: $main-color;
  }
}
</style>
