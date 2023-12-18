<script setup lang="ts">
import { SUB_VALUE } from '@/config/key';
import { reactive, watch, computed } from 'vue';
import SingleKey from '@/components/key/SingleKey.vue';

import type { KEY_PERMUTATION_VALUE } from '@/config/key';

type Props = {
  unit: number;
  backgroundColor: string;
  color: string;
  value: string;
  code: string;
  keysPressed: any;
  heightType: string;
  type: string;
  area: Array<Array<KEY_PERMUTATION_VALUE>> | null;
  currentSystem: string;
};

const props = withDefaults(defineProps<Partial<Props>>(), {
  unit: 1,
  backgroundColor: '#4F5767',
  color: '#fff',
  value: '',
  code: '',
  keysPressed: {},
  heightType: 'normal',
  type: 'normal',
  area: null,
  currentSystem: 'win'
});

const state = reactive({
  isActive: false // 是否已经被点击过了
});

watch(
  () => props.keysPressed,
  (val) => {
    if (val) {
      const triggeredKeys = Object.keys(val);
      if (triggeredKeys.includes(props.code)) {
        state.isActive = true;
      }
    }
  },
  {
    deep: true
  }
);

const isKeyPressed = computed(() => {
  return props.keysPressed[props.code];
});

const subValue = computed(() => {
  return SUB_VALUE[props.value];
});
</script>
<template>
  <div class="y-single-key__inner" v-if="type === 'inner' && area">
    <div class="y-single-key__inner-item" v-for="(v, i) in area" :key="i">
      <single-key
        v-for="item in v"
        :key="item.code"
        height-type="half"
        :code="currentSystem === 'mac' && item.macCode ? item.macCode : item.code"
        :value="currentSystem === 'mac' && item.macValue ? item.macValue : item.value"
        :unit="item.unit"
        :keys-pressed="keysPressed"
      ></single-key>
    </div>
  </div>
  <div
    v-else
    class="y-single-key"
    :class="[
      code ? '' : 'y-single-key--empty',
      'y-single-key--' + unit,
      subValue ? 'y-single-key__small-size' : '',
      value.length > 1 ? 'y-single-key__word' : 'y-single-key__letter',
      state.isActive ? 'y-single-key--active' : '',
      isKeyPressed ? 'y-single-key--pressed' : '',
      heightType === 'half' ? 'y-single-key--half' : ''
    ]"
    :style="{
      backgroundColor,
      color
    }"
  >
    <span v-if="subValue" class="y-single-key__sub-value">{{ subValue }}</span>
    <span class="y-single-key__value">{{ value }}</span>
  </div>
</template>
<style lang="scss">
$unit: 40px;
.y-single-key {
  display: flex;
  align-items: center;
  width: $unit; /* 键帽宽度 */
  height: $unit; /* 键帽高度 */
  font-size: 20px; /* 字体大小 */
  font-weight: bold;
  border-radius: 5px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4); /* 键帽阴影效果 */
  padding: 6px;
  margin: 4px 0;
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0);
    transition: background-color 0.1s;
  }
}
.y-single-key--half {
  height: calc($unit / 2);
  margin: 1px 0;
}
.y-single-key--active {
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.2);
  }
}
.y-single-key--pressed {
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.6);
  }
}
.y-single-key--empty {
  background: rgba(0, 0, 0, 0) !important;
  box-shadow: none !important;
  &:after {
    content: none;
  }
}
.y-single-key__small-size {
  font-size: 12px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
}
/* 这是单词类型的，比如 Enter Esc F1，字号需要小一点                                                                                                                           */
.y-single-key__word {
  font-size: 12px;
}
.y-single-key__letter {
  align-items: start;
  line-height: 10px;
}
.y-single-key--1 {
  width: $unit;
}
.y-single-key--125 {
  width: $unit * 1.25;
}
.y-single-key--15 {
  width: $unit * 1.5;
}
.y-single-key--175 {
  width: $unit * 1.75;
}
.y-single-key--2 {
  width: $unit * 2;
}
.y-single-key--225 {
  width: $unit * 2.25;
}
.y-single-key--25 {
  width: $unit * 2.5;
}
.y-single-key--275 {
  width: $unit * 2.75;
}
.y-single-key--3 {
  width: $unit * 3;
}
.y-single-key--6 {
  width: $unit * 6;
}
.y-single-key--7 {
  width: $unit * 7;
}

.y-single-key__inner {
  display: flex;
  flex-direction: column;
}
.y-single-key__inner-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
