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
    padding: 8px 12px;
    color: $gray-08;
    font-size: 14px;
    background-color: $background-gray;
    background-image: none;
    border: 1px solid $gray-02;
    border-radius: $radius-md;
    transition: border-color 0.2s $ease-out, box-shadow 0.2s $ease-out;
    outline: 0;
    &:hover {
      border-color: $gray-06;
    }
    &:focus {
      border-color: $main-color;
      box-shadow: 0 0 0 3px rgba(21, 197, 206, 0.16);
    }
  }
}
.y-input--err {
  input {
    border-color: $main-red;
    &:hover,
    &:focus {
      border-color: $main-red;
      box-shadow: 0 0 0 3px rgba(246, 76, 76, 0.16);
    }
  }
}
.y-input__error-text {
  font-size: 12px;
  color: $main-red;
  left: 0;
  top: calc(100% + 2px);
  position: absolute;
}
</style>
