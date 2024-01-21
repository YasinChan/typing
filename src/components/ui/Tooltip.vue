<script lang="ts" setup>
import { ref } from 'vue';
import { useElementHover } from '@vueuse/core';

const tooltipRef = ref<HTMLElement | null>(null);
const isHovered = useElementHover(tooltipRef);
const props = withDefaults(
  defineProps<{
    placement?: string;
    trigger?: string;
    content?: string;
    delay?: number;
    offset?: number;
  }>(),
  {
    placement: 'top',
    trigger: 'hover',
    content: '',
    delay: 0,
    offset: 0
  }
);
</script>
<template>
  <span ref="tooltipRef" class="tooltip">
    <Transition name="menu">
      <span v-if="isHovered" class="tooltip__content">{{ content }}</span>
    </Transition>
    <slot></slot>
  </span>
</template>
<style lang="scss">
.tooltip {
  position: relative;
  display: inline-flex;
}
.tooltip__content {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background-color: $gray-08;
  color: $gray-02;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-top-color: $gray-08;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
