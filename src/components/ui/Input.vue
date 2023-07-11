<script setup lang="ts">
defineProps({
  type: {
    default: 'text',
    type: String
  },
  placeholder: {
    default: '',
    type: String
  },
  value: {
    default: '',
    type: [String, Number]
  },
  name: {
    default: '',
    type: String
  },
  errorText: {
    default: '',
    type: String
  }
});
const emitter = defineEmits(['update:value']);

const inputHandler = (event: any): any => {
  emitter('update:value', (event.target as HTMLInputElement).value);
};
</script>
<template>
  <div class="y-input" :class="[errorText ? 'y-input--err' : '']">
    <input
      :type="type"
      :value="value"
      :name="name"
      @input="inputHandler"
      :placeholder="placeholder"
    />
    <span class="y-input__error-text">{{ errorText }}</span>
  </div>
</template>
<style lang="scss">
.y-input {
  padding-bottom: 10px;
  input {
    touch-action: manipulation;
    -webkit-appearance: none;
    box-sizing: border-box;
    margin: 0;
    list-style: none;
    position: relative;
    display: inline-block;
    width: 100%;
    padding: 4px 11px;
    color: $gray-08;
    font-size: 14px;
    background-color: $layout-background-gray;
    background-image: none;
    border: 1px solid $gray-06;
    border-radius: 2px;
    transition: all 0.3s;
    outline: 0;
    &:hover,
    &:focus {
      border-color: $main-color-hover;
      border-right-width: 1px;
      outline: 0;
    }
  }
}
.y-input--err {
  input {
    border: 1px solid $main-red;
    &:hover,
    &:focus {
      border-color: $main-red-hover;
      border-right-width: 1px;
    }
  }
}
.y-input__error-text {
  font-size: 12px;
  color: $main-red;
}
</style>
