<script lang="ts">
import { defineComponent, h } from 'vue';

/** 工具栏分组分隔线 */
export const TypingToolbarDivider = defineComponent({
  name: 'TypingToolbarDivider',
  setup() {
    return () => h('span', { class: 'y-typing-toolbar__divider', 'aria-hidden': 'true' });
  }
});

/** 一组 chip，保证 Tooltip 里的间距和工具栏一致 */
export const TypingChipGroup = defineComponent({
  name: 'TypingChipGroup',
  setup(_, { slots }) {
    return () => h('span', { class: 'y-typing-chip-group' }, slots.default?.());
  }
});
</script>

<script setup lang="ts">
// 打字页共用操作胶囊：字号、字距、字体与打字区隔离，避免英文/中文模式看起来不一样
</script>

<template>
  <Transition name="menu">
    <div class="y-typing-toolbar">
      <slot />
    </div>
  </Transition>
</template>

<style lang="scss">
.y-typing-toolbar {
  transition: opacity 0.22s $ease-out, visibility 0.22s $ease-out;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 2px;
  padding: 4px;
  background: $layout-background-gray;
  border-radius: $radius-full;
  box-shadow: $shadow-sm;
  // 用界面字体，不跟 main 上的打字字体走
  font-family:
    Quotes,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
}

.y-typing-toolbar__divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: $gray-02;
  opacity: 0.7;
  flex-shrink: 0;
}

.y-typing-chip-group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.y-typing-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 32px;
  height: 32px;
  padding: 0 12px;
  border-radius: $radius-full;
  color: $gray-06;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  transition: color 0.2s $ease-out, background-color 0.2s $ease-out;
  &:hover {
    color: $main-color;
  }
  &.is-active {
    color: $label-white;
    background: $main-color;
  }
}

.y-typing-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  cursor: pointer;
  color: $gray-06;
  flex-shrink: 0;
  transition: background-color 0.2s $ease-out, color 0.2s $ease-out;
  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
  &:hover {
    color: $main-color;
    background: $background-gray;
  }
  &.is-active {
    color: $main-color;
  }
}
</style>
