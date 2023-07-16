<script setup lang="ts">
import { reactive } from 'vue';
const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  }
});
const emitter = defineEmits(['click']);
const state = reactive({
  showImg: false
});

const imgLoad = () => {
  state.showImg = true;
};
</script>

<template>
  <div class="y-image">
    <img
      @load="imgLoad"
      class="y-image__img"
      :class="[state.showImg ? 'y-image__img--show' : '']"
      :src="src"
      :alt="alt"
    />
  </div>
</template>

<style lang="scss">
.y-image {
  position: relative;
  &:after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: url(https://tf.yasinchan.com/YDHpqNpF0xPDsxIiDCPOejwCdnsLi2bf/f83f561a35c2ef1b2ad3b4b1342ad249%20%281%29.png)
      no-repeat;
    background-size: 100%;
    opacity: 0.6;
    z-index: -1;
  }
}
.y-image__img {
  transition: opacity 0.2s ease-in-out 0.1s;
  opacity: 0;
  width: 100%;
  height: 100%;
}
.y-image__img--show {
  opacity: 1;
}
</style>
