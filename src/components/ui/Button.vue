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
    @click="handlerClick"
    :disabled="disable"
    :form="form"
    class="y-button"
    :class="[
      disable ? 'y-button--disabled' : '',
      size === 'small' ? 'y-button--small' : '',
      size === 'large' ? 'y-button--large' : ''
    ]"
  >
    <slot>按钮</slot>
  </button>
</template>

<style lang="scss">
.y-button {
  display: inline-block;
  white-space: nowrap;
  border: none;
  box-shadow: 0 2px #00000004;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  padding: 6px 15px;
  font-size: 14px;
  border-radius: 2px;
  color: #fff;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  background: $main-color;
  &:hover {
    background: $main-color-hover;
  }
}
.y-button--small {
  padding: 4px 10px;
  font-size: 12px;
}
.y-button--disabled {
  cursor: not-allowed;
  background: $main-color-light;
  &:hover {
    background: $main-color-light;
  }
}
</style>
