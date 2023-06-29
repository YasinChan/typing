<script setup lang="ts"></script>

<template>
  <button class="y-button">
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
  background: $primary-y-blue;
  &:hover {
    background: $primary-y-blue-hover;
  }
}
</style>
