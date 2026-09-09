<script setup lang="ts">
import { watch } from 'vue';
import YButton from '@/components/ui/Button.vue';
import IcoClose from '@/assets/svg/close.svg';
const props = withDefaults(
  defineProps<
    Partial<{
      show: boolean;
      className: string;
      zIndex: number;
      showCancel: boolean;
      closeOnClickMask: boolean;
      showCloseBtn: boolean;
    }>
  >(),
  {
    show: false,
    zIndex: 1000,
    showCancel: false,
    closeOnClickMask: true,
    showCloseBtn: true
  }
);

const emit = defineEmits(['close', 'confirm']);

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'Escape') {
    emit('close');
  }
};

watch(
  () => props.show,
  (val) => {
    if (val) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  },
  {
    immediate: true
  }
);
function clickMask() {
  if (props.closeOnClickMask) {
    emit('close');
  }
}
</script>

<template>
  <Transition name="modal">
    <Teleport to="body">
      <div v-if="show" class="y-modal__mask" :style="{ zIndex: zIndex }" @click="clickMask">
        <div class="y-modal__container" :class="className" @click.stop>
          <div class="y-modal__header flex-center--y">
            <slot name="header">default header</slot>
            <IcoClose v-if="showCloseBtn" class="y-modal__close" @click="emit('close')"></IcoClose>
          </div>

          <div class="y-modal__body">
            <slot name="body">default body</slot>
          </div>

          <div class="y-modal__footer">
            <slot name="footer">
              <YButton @click="emit('confirm')">{{ $t('confirm') }}</YButton>
              <YButton
                v-if="showCancel"
                style="margin-left: 12px"
                theme="secondary"
                @click="emit('close')"
              >
                取消
              </YButton>
            </slot>
          </div>
        </div>
      </div>
    </Teleport>
  </Transition>
</template>

<style lang="scss">
.y-modal__mask {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: $overlay;
  backdrop-filter: blur(8px);
  display: flex;
  padding: 24px;
}

.y-modal__container {
  width: 380px;
  max-width: 100%;
  margin: auto;
  padding: 24px;
  background-color: $layout-background-gray;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  position: relative;
  padding-bottom: 80px;
}

.y-modal__header {
  color: $gray-08;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  h3 {
    margin-top: 0;
    font-size: 18px;
  }
}
.y-modal__close {
  fill: $gray-06;
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: $radius-sm;
  transition: fill 0.2s $ease-out, transform 0.2s $ease-out;
  &:hover {
    fill: $gray-08;
    transform: rotate(90deg);
  }
}

.y-modal__body {
  margin: 20px 0;
}

.y-modal__footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 16px 24px 24px;
  bottom: 0;
  background-color: $layout-background-gray;
  border-radius: 0 0 $radius-lg $radius-lg;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s $ease-out;
}
.modal-enter-active .y-modal__container,
.modal-leave-active .y-modal__container {
  transition: transform 0.22s $ease-out, opacity 0.22s $ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .y-modal__container,
.modal-leave-to .y-modal__container {
  transform: translateY(12px) scale(0.98);
  opacity: 0;
}
</style>
