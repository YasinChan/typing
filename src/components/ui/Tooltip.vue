<script lang="ts" setup>
import { ref } from 'vue';
import { useElementHover } from '@vueuse/core';

const tooltipRef = ref<HTMLElement | null>(null);
const isHovered = useElementHover(tooltipRef);
withDefaults(
  defineProps<{
    placement?: string;
    trigger?: string;
    content?: string;
    html?: string;
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
      <div v-if="isHovered" class="tooltip__popover">
        <span v-if="content" class="tooltip__content">{{ content }}</span>
        <span v-if="html" class="tooltip__content" v-html="html"></span>
      </div>
    </Transition>
    <slot></slot>
  </span>
</template>
<style lang="scss">
.tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.tooltip__popover {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}
.tooltip__content {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background-color: $gray-08;
  color: $background-gray;
  border-radius: $radius-sm;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 20px;
  box-shadow: $shadow-md;
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
