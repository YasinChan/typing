<script lang="ts" setup>
import { reactive } from 'vue';

// components
import Tooltip from '@/components/ui/Tooltip.vue';

// types
import type { TypingRecordType, TypingRecordItemType } from '@/types';

// svg
import IcoReplay from '@/assets/svg/replay.svg';
import IcoChange from '@/assets/svg/change.svg';

const props = defineProps<{
  typingRecord?: TypingRecordType;
}>();
const emit = defineEmits(['restart']);
const state = reactive({
  currentTime: 0,
  currentOperation: [] as TypingRecordItemType[]
});

function replay() {
  console.log(props.typingRecord);
  state.currentTime = new Date().getTime();
  executeTimeline();
}
function executeTimeline() {
  if (!props.typingRecord) {
    return;
  }
  const keys = Object.keys(props.typingRecord)
    .map(Number)
    .sort((a, b) => a - b); // 按键值排序

  let currentIndex = 0;

  function executeStep() {
    if (!props.typingRecord) {
      return;
    }
    const currentTime = keys[currentIndex];
    state.currentOperation = props.typingRecord[currentTime];

    // if (state.currentOperation) {
    //   console.log(`Executing at time ${currentTime}: ${state.currentOperation}`);
    // }

    currentIndex++;

    if (currentIndex < keys.length) {
      const nextTime = keys[currentIndex];
      const delay = nextTime - currentTime;
      setTimeout(executeStep, delay * 100); // 延时执行下一个操作
    }
  }

  executeStep(); // 开始执行时间轴
}
</script>
<template>
  <div class="result-content">正确率：</div>
  <div class="result-content">速度：</div>
  <div class="result-content__toolbar">
    <Tooltip class="result-content__svg" content="重新开始">
      <IcoChange @click="emit('restart')"></IcoChange>
    </Tooltip>
    <Tooltip class="result-content__svg" content="查看回放">
      <IcoReplay @click="replay"></IcoReplay>
    </Tooltip>
  </div>
  <div class="result-content__replay" v-if="state.currentOperation?.length">
    <span
      class="result-content__replay-item"
      :class="{
        'result-content__replay-item--underline': item.isComposition
      }"
      v-for="(item, index) in state.currentOperation"
      :key="index"
    >
      {{ item.word }}
    </span>
  </div>
</template>
<style lang="scss">
.result-content__svg {
  svg {
    width: 28px;
    height: 28px;
    fill: $gray-06;
    cursor: pointer;
  }
  margin-right: 40px;
}
.result-content {
  font-size: 16px;
  color: $gray-06;
  margin-bottom: 40px;
}
.result-content__toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}
.result-content__replay {
  line-height: 28px;
}
.result-content__replay-item--underline {
  text-decoration: underline;
}
</style>
