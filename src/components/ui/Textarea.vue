<script setup lang="ts">
import { reactive, watch } from 'vue';
const props = withDefaults(
  defineProps<
    Partial<{
      placeholder: string;
      modelValue: string | number | string[];
      maxLength: number;
    }>
  >(),
  {
    placeholder: '',
    modelValue: '',
    maxLength: 80
  }
);

const state = reactive({
  leftLength: props.maxLength | 80,
  value: ''
});

const emitter = defineEmits(['update:modelValue']);

watch(
  () => state.value,
  (val) => {
    emitter('update:modelValue', val);
    state.leftLength = props.maxLength - (val as string).length;
  },
  {
    immediate: true
  }
);
</script>
<template>
  <div class="y-textarea">
    <textarea v-model="state.value" :placeholder="placeholder" :maxlength="maxLength" />
    <span class="y-textarea__left-length">{{ state.leftLength }}</span>
  </div>
</template>
<style lang="scss">
.y-textarea {
  position: relative;
  textarea {
    touch-action: manipulation;
    -webkit-appearance: none;
    box-sizing: border-box;
    margin: 0;
    list-style: none;
    position: relative;
    display: inline-block;
    width: 100%;
    padding: 4px 30px 4px 10px;
    color: $gray-08;
    font-size: 14px;
    line-height: 1.5;
    height: 60px;
    background-color: $gray-01;
    border: 1px solid $gray-02;
    border-radius: 4px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    resize: none;
    &:focus {
      outline: none;
      border-color: $main-color;
    }
  }
}
.y-textarea__left-length {
  position: absolute;
  right: 6px;
  bottom: 6px;
  color: $gray-04;
  font-size: 14px;
}
</style>
