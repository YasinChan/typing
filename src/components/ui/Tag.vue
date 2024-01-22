<script lang="ts" setup>
defineProps<{
  text: string;
}>();
</script>
<template>
  <div class="y-tag">
    <slot name="icon"></slot>
    <span class="y-tag-text">{{ text }}</span>
  </div>
</template>
<style lang="scss">
.y-tag {
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
  border-radius: 4px;
  line-height: 20px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background-color: $main-color;
  margin-right: 4px;
}
</style>
