<script setup lang="ts">
import { SUB_VALUE } from '@/config/key';
import { reactive, watch, computed } from 'vue';

const props = defineProps({
  /**
   * 键帽的宽度
   * 1、125、15、225、25
   */
  unit: {
    type: Number,
    default: 1
  },
  /**
   * 键帽的背景颜色
   */
  backgroundColor: {
    type: String,
    default: '#4F5767' // //#4F5767 #F4F4F5
  },
  /**
   * 键帽上的字体颜色
   */
  color: {
    type: String,
    default: '#fff'
  },
  /**
   * 键帽上的主要字符
   */
  value: {
    type: String,
    default: 'A'
  },
  code: {
    type: String,
    default: ''
  },
  /**
   * 当前按下的键盘的 code
   */
  keysPressed: {
    type: [Object, null],
    default: () => ({})
  }
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
  <div
    class="y-single-key"
    :class="[
      'y-single-key--' + unit,
      subValue ? 'y-single-key__small-size' : '',
      value.length > 1 ? 'y-single-key__word' : 'y-single-key__letter',
      state.isActive ? 'y-single-key--active' : '',
      isKeyPressed ? 'y-single-key--pressed' : ''
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
  box-shadow: $key-box-shadow; /* 键帽阴影效果 */
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
.y-single-key--6 {
  width: $unit * 6;
}
.y-single-key--7 {
  width: $unit * 7;
}
</style>
