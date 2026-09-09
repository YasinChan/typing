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
watch(
  () => props.modelValue,
  (val) => {
    state.value = val as string;
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
    padding: 10px 32px 10px 12px;
    color: $gray-08;
    font-size: 14px;
    line-height: 1.6;
    height: 60px;
    background-color: $background-gray;
    border: 1px solid $gray-02;
    border-radius: $radius-md;
    transition: border-color 0.2s $ease-out, box-shadow 0.2s $ease-out;
    resize: none;
    &:hover {
      border-color: $gray-06;
    }
    &:focus {
      outline: none;
      border-color: $main-color;
      box-shadow: 0 0 0 3px rgba(21, 197, 206, 0.16);
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
