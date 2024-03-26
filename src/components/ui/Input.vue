<script setup lang="ts">
withDefaults(
  defineProps<
    Partial<{
      type: string;
      placeholder: string;
      modelValue: string | number | null;
      name: string;
      errorText: string;
      maxLength: number;
    }>
  >(),
  {
    type: 'text',
    placeholder: '',
    modelValue: '',
    name: '',
    errorText: '',
    maxLength: 1000
  }
);

const emitter = defineEmits(['update:modelValue']);

const inputHandler = (event: any): any => {
  emitter('update:modelValue', (event.target as HTMLInputElement).value);
};

const blurHandler = (event: any): any => {
  emitter('update:modelValue', (event.target as HTMLInputElement).value.trim());
};
</script>
<template>
  <div class="y-input" :class="[errorText ? 'y-input--err' : '']">
    <input
      :type="type"
      :value="modelValue"
      @blur="blurHandler"
      :name="name"
      @input="inputHandler"
      :placeholder="placeholder"
      :maxlength="maxLength"
    />
    <span class="y-input__error-text">{{ errorText }}</span>
  </div>
</template>
<style lang="scss">
.y-input {
  position: relative;
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
      border-color: $main-color;
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
      border-color: $main-red;
      border-right-width: 1px;
    }
  }
}
.y-input__error-text {
  font-size: 12px;
  color: $main-red;
  left: 0;
  top: 25px;
  position: absolute;
}
</style>
