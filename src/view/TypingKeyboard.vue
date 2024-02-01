<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { KEY_PERMUTATION_68, KEY_PERMUTATION_STANDARD, KEY_PERMUTATION_MBP } from '@/config/key';

// components
import SingleKey from '@/components/key/SingleKey.vue';
import KeyWrap from '@/components/key/KeyWrap.vue';
import YModal from '@/components/ui/Modal.vue';
import ListItem from '@/components/ui/ListItem.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// types
import type { KeyBoardType, SystemType } from '@/types';

const screenBottomRef = ref();
const state = reactive<{
  currentKeyBoard: KeyBoardType;
  currentSystem: SystemType;
  keyboardModal: boolean;
}>({
  currentKeyBoard: 'standard', // '68' | 'standard' | 'mbp'
  currentSystem: 'win', // 'mac' | 'win'
  keyboardModal: false
});

const configStore = useConfigStore();
const { printContent, currentCode, onlyShowMain } = storeToRefs(configStore);

let timeout: any = null;

watch(
  () => printContent.value,
  (val) => {
    if (val) {
      if (!timeout) {
        timeout = setTimeout(() => {
          screenBottomRef.value &&
            screenBottomRef.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
          clearTimeout(timeout);
          timeout = null;
        }, 200);
      }
    }
  }
);
const changeKeyboard = (keyboard: KeyBoardType) => {
  if (keyboard === 'mbp') {
    state.currentSystem = 'mac';
  }
  state.currentKeyBoard = keyboard;
};
</script>
<template>
  <main>
    <div class="y-keyboard__setting-wrap">
      <Transition name="menu">
        <div class="flex-center--y" style="justify-content: right" v-show="!onlyShowMain">
          <div
            class="y-keyboard__setting-item"
            v-if="state.currentSystem === 'win'"
            @click="state.currentSystem = 'mac'"
          >
            Windows
          </div>
          <div
            class="y-keyboard__setting-item"
            v-if="state.currentSystem === 'mac'"
            @click="state.currentSystem = 'win'"
          >
            Mac
          </div>
          <div class="y-keyboard__setting-item" @click="state.keyboardModal = true">
            切换键盘配列
          </div>
        </div>
      </Transition>
    </div>
    <div class="y-main__screen-wrap">
      <div class="y-main__screen" :class="[printContent ? 'y-main__screen--word' : '']">
        <div class="y-main__screen-main" v-html="printContent"></div>
        <div class="y-main__screen-bottom" ref="screenBottomRef"></div>
      </div>
      <div
        class="y-main__sub-screen"
        :class="[currentCode.length ? 'y-main__sub-screen--word' : '']"
      >
        <div class="y-main__sub-screen-text" v-html="currentCode.join('')"></div>
      </div>
    </div>
    <key-wrap
      v-if="state.currentKeyBoard === '68'"
      title="68 配列键盘"
      className="y-key-wrap__68"
      v-slot="{ keysPressed }"
    >
      <template v-for="(value, key) in KEY_PERMUTATION_68" :key="key">
        <div class="y-keyboard__wrap" :class="['y-keyboard__' + key]">
          <div class="y-keyboard__line" v-for="(v, index) in value" :key="index + 'line'">
            <single-key
              v-for="item in v"
              :key="item.code"
              :code="state.currentSystem === 'mac' && item.macCode ? item.macCode : item.code"
              :value="state.currentSystem === 'mac' && item.macValue ? item.macValue : item.value"
              :unit="item.unit"
              :keys-pressed="keysPressed"
            ></single-key>
          </div>
        </div>
      </template>
    </key-wrap>
    <key-wrap
      v-if="state.currentKeyBoard === 'standard'"
      title="标准配列键盘"
      className="y-key-wrap__standard"
      v-slot="{ keysPressed }"
    >
      <template v-for="(value, key) in KEY_PERMUTATION_STANDARD" :key="key">
        <div class="y-keyboard__wrap" :class="['y-keyboard__' + key]">
          <div class="y-keyboard__line" v-for="(v, index) in value" :key="index + 'line'">
            <single-key
              v-for="item in v"
              :key="item.code"
              :code="state.currentSystem === 'mac' && item.macCode ? item.macCode : item.code"
              :value="state.currentSystem === 'mac' && item.macValue ? item.macValue : item.value"
              :unit="item.unit"
              :keys-pressed="keysPressed"
            ></single-key>
          </div>
        </div>
      </template>
    </key-wrap>
    <key-wrap
      v-if="state.currentKeyBoard === 'mbp'"
      title="MBP 配列键盘"
      className="y-key-wrap__mbp"
      v-slot="{ keysPressed }"
    >
      <template v-for="(value, key) in KEY_PERMUTATION_MBP" :key="key">
        <div class="y-keyboard__wrap" :class="['y-keyboard__' + key]">
          <div class="y-keyboard__line" v-for="(v, index) in value" :key="index + 'line'">
            <single-key
              v-for="item in v"
              :key="item.code"
              :type="item.type"
              :area="item.area"
              :current-system="state.currentSystem"
              :code="state.currentSystem === 'mac' && item.macCode ? item.macCode : item.code"
              :value="state.currentSystem === 'mac' && item.macValue ? item.macValue : item.value"
              :unit="item.unit"
              :keys-pressed="keysPressed"
            ></single-key>
          </div>
        </div>
      </template>
    </key-wrap>
  </main>
  <YModal
    :show="state.keyboardModal"
    @close="state.keyboardModal = false"
    @confirm="state.keyboardModal = false"
  >
    <template #header>
      <h3>选择键盘</h3>
    </template>
    <template #body>
      <div class="y-show-select__container gray-08">
        <ListItem @click="changeKeyboard('standard')">标准配列键盘</ListItem>
        <ListItem @click="changeKeyboard('68')">68 配列键盘</ListItem>
        <ListItem @click="changeKeyboard('mbp')">MBP 配列键盘</ListItem>
      </div>
    </template>
  </YModal>
</template>
<style lang="scss">
.y-main__screen-wrap {
  display: flex;
  margin: 20px auto;
  justify-content: center;
  align-items: flex-end;
  position: relative;
}
.y-keyboard__setting-wrap {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
  transition: transform 0.2s ease;
  font-size: 16px;
  color: $gray-06;
}
.y-keyboard__setting-item {
  cursor: pointer;
}
.y-keyboard__setting-item:not(:last-child) {
  position: relative;
  margin-right: 30px;
  &::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 12px;
    background: $gray-02;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.y-main__selection-item {
  padding: 4px 8px;
  color: $gray-06;
  cursor: pointer;
  text-align: right;
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
  &:hover {
    color: $main-color;
  }
}
.y-main__screen {
  max-width: 45vw;
  width: 600px;
  height: 50px;
  overflow: auto;
  font-size: 24px;
  line-height: 30px;
  font-weight: 600;
  color: $gray-06;
  word-break: break-all;
  border-radius: 8px;
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

.y-main__sub-screen {
  margin-left: 30px;
  width: 190px;
  height: 80px;
  overflow: hidden;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
  color: $gray-06;
  word-break: break-all;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
  &.y-main__sub-screen--word {
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
.y-main__sub-screen-text {
  margin-top: -16px;
  padding-left: 10px;
}

.y-key-wrap {
  box-sizing: content-box;
  padding: 8px 12px;
  background: #f0f2eb;
  border-radius: 8px;
  box-shadow: $key-box-shadow;
  margin: 0 auto;
}
.y-key-wrap__68 {
  width: 710px;
  .y-keyboard__main-area {
    width: 100%;
  }
}
.y-key-wrap__standard {
  width: 1000px;
  .y-keyboard__main-area {
    width: 650px;
  }
  .y-keyboard__sub-area {
    width: 130px;
  }
  .y-keyboard__number-area {
    width: 180px;
  }
}
.y-key-wrap__mbp {
  width: 700px;
  .y-keyboard__main-area {
    width: 100%;
  }
}
.y-keyboard__wrap {
  flex-shrink: 0;
}
.y-keyboard__line {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
</style>
