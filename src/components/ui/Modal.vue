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
    zIndex: 1,
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
            <IcoClose v-if="showCloseBtn" @click="emit('close')"></IcoClose>
          </div>

          <div class="y-modal__body">
            <slot name="body">default body</slot>
          </div>

          <div class="y-modal__footer">
            <slot name="footer">
              <YButton @click="emit('confirm')">{{ $t('confirm') }}</YButton>
              <YButton
                v-if="showCancel"
                style="margin-left: 20px"
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
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.y-modal__container {
  width: 300px;
  margin: auto;
  padding: 20px;
  background-color: $layout-background-gray;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  position: relative;
  padding-bottom: 72px;
}

.y-modal__header {
  color: $gray-08;
  justify-content: space-between;
  width: 100%;
  h3 {
    margin-top: 0;
  }
  svg {
    fill: $gray-08;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
}

.y-modal__body {
  margin: 20px 0;
}

.y-modal__footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 20px;
  bottom: 0;
  background-color: $layout-background-gray;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .y-modal__container,
.modal-leave-to .y-modal__container {
  -webkit-transform: scale(0.5);
  transform: scale(0.5);
}
</style>
