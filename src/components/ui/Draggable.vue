<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';

// svg
import IcoMove from '@/assets/svg/move.svg';

const draggableElement = ref<HTMLElement | null>(null);

let initialMousePosition = { x: 0, y: 0 };
let initialBoxPosition = { x: 0, y: 0 };

const state = reactive({
  isShowContent: true
});

// 组件挂载时添加必要的事件监听
onMounted(async () => {
  await nextTick();

  // const MAX_CONTENT_WIDTH = 1280;
  if (draggableElement.value) {
    const box = draggableElement.value;
    const rect = box.getBoundingClientRect();

    const viewportWidth = window.innerWidth;

    let newX, newY;

    // if (viewportWidth > MAX_CONTENT_WIDTH) {
    //   newX = viewportWidth / 2 + MAX_CONTENT_WIDTH / 2 - rect.width;
    // } else {
    // }
    newX = viewportWidth - rect.width - 20;
    newY = 100;

    box.style.transform = `translate(${newX}px, ${newY}px)`;
  }
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
});

function handleMouseDown(event: MouseEvent) {
  if (draggableElement.value) {
    initialMousePosition = { x: event.clientX, y: event.clientY };
    initialBoxPosition = {
      x: draggableElement.value.getBoundingClientRect().left,
      y: draggableElement.value.getBoundingClientRect().top
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }
}

// 监听mousemove事件来实时更新框的位置
function handleMouseMove(event: MouseEvent) {
  if (draggableElement.value) {
    let newX = initialBoxPosition.x + (event.clientX - initialMousePosition.x);
    let newY = initialBoxPosition.y + (event.clientY - initialMousePosition.y);

    // 限制框在视口范围内
    const box = draggableElement.value;
    const rect = box.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    newX = Math.max(0, newX);
    newX = Math.min(newX, viewportWidth - rect.width);
    newY = Math.max(0, newY);
    newY = Math.min(newY, viewportHeight - rect.height);

    box.style.transform = `translate(${newX}px, ${newY}px)`;
  }
}

// 监听 mouseup 事件来结束拖动并移除 mousemove 事件监听
function handleMouseUp() {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
}

function toggleContent() {
  state.isShowContent = !state.isShowContent;
}

function hideContent() {
  state.isShowContent = false;
}
function showContent() {
  state.isShowContent = true;
}

defineExpose({
  hideContent,
  showContent
});
</script>

<template>
  <Teleport to="body">
    <div ref="draggableElement" class="draggable">
      <div class="draggable__head flex-center--y-between" @mousedown.prevent="handleMouseDown">
        <div class="flex-center--y-between">
          <IcoMove style="flex-shrink: 0"></IcoMove>
          <slot name="header"></slot>
        </div>
        <div
          class="draggable__btn"
          :class="{
            'draggable__btn-plus': !state.isShowContent,
            'draggable__btn-minus': state.isShowContent
          }"
          @click="toggleContent"
        ></div>
      </div>
      <slot name="remind"></slot>
      <div class="draggable__content" v-show="state.isShowContent">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
.draggable {
  position: fixed;
  width: 410px;
  color: $gray-08;
  background-color: $layout-background-gray;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  top: 0;
  left: 0;
  border-radius: 2px;
  overflow: hidden;
  z-index: 9;
}
.draggable__head {
  width: 100%;
  height: 40px;
  cursor: move;
  padding: 0 10px;
  svg {
    fill: $gray-08;
    width: 20px;
    height: 20px;
  }
}

.draggable__content {
  padding: 10px;
  border-top: 1px solid $gray-04;
}

.draggable__btn {
  display: inline-block;
  background: $gray-06 no-repeat center;
  width: 20px;
  height: 20px;
  border-radius: 2px;
  cursor: pointer;
  color: $layout-background-gray;
  flex-shrink: 0;
  transition: color 0.2s, background-color 0.2s;
}
.draggable__btn-plus {
  background-image: linear-gradient(to top, currentColor, currentColor),
    linear-gradient(to top, currentColor, currentColor);
  background-size: 12px 2px, 2px 12px;
}
.draggable__btn-minus {
  background-image: linear-gradient(to top, currentColor, currentColor);
  background-size: 12px 2px;
}
</style>
