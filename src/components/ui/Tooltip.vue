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
      <div v-if="isHovered">
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
}
.tooltip__content {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background-color: $main-color;
  color: $label-white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  line-height: 20px;
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-top-color: $main-color;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
