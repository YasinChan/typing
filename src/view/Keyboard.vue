<script setup lang="ts">
import SingleKey from '@/components/key/SingleKey.vue';
import KeyWrap from '@/components/key/KeyWrap.vue';
import { KEY_PERMUTATION } from '@/config/key';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';
import { ref, watch } from 'vue';

const screenBottomRef = ref();

const configStore = useConfigStore();
const { printContent } = storeToRefs(configStore);

let timeout: any = null;

watch(
  () => printContent.value,
  (val) => {
    if (val) {
      if (!timeout) {
        timeout = setTimeout(() => {
          clearTimeout(timeout);
          timeout = null;
          screenBottomRef.value &&
            screenBottomRef.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 200);
      }
    }
  }
);
</script>
<template>
  <div class="y-main">
    <div class="y-main__screen" :class="[printContent ? 'y-main__screen--word' : '']">
      <div class="y-main__screen-main" v-html="printContent"></div>
      <div class="y-main__screen-bottom" ref="screenBottomRef"></div>
    </div>
    <key-wrap v-slot="{ keysPressed }">
      <template v-for="(value, key) in KEY_PERMUTATION" :key="key">
        <div class="y-keyboard__wrap" :class="['y-keyboard__' + key]">
          <div class="y-keyboard__line" v-for="(v, index) in value" :key="index + 'line'">
            <single-key
              v-for="item in v"
              :key="item.code"
              :code="item.code"
              :value="item.value"
              :unit="item.unit"
              :keys-pressed="keysPressed"
            ></single-key>
          </div>
        </div>
      </template>
    </key-wrap>
  </div>
</template>
<style lang="scss">
.y-main__screen {
  width: 600px;
  height: 50px;
  overflow: auto;
  font-size: 24px;
  line-height: 30px;
  font-weight: 600;
  color: $gray-06;
  word-break: break-all;
  border-radius: 8px;
  margin: 20px auto;
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
  &.y-main__screen--word {
    box-shadow: 2px 2px 5px 2px $box-shadow-color;
    transform: translate3d(0, -6px, 0);
  }
  &:hover {
    box-shadow: 2px 2px 5px 2px $box-shadow-color;
    transform: translate3d(0, -10px, 0);
  }
  &::-webkit-scrollbar {
    display: none;
  }
}
.y-main__screen-main {
  width: 100%;
  padding: 20px 30px 0;
}
.y-keyboard__wrap {
  width: 710px;
  box-sizing: content-box;
  padding: 8px 12px;
  background: #f0f2eb;
  border-radius: 8px;
  box-shadow: $key-box-shadow;
  margin: 0 auto;
}
.y-keyboard__line {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
</style>
