<script setup lang="ts">
import YButton from '@/components/ui/Button.vue';
defineProps({
  show: {
    default: false,
    type: Boolean
  }
});
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="y-modal__mask" @click="$emit('close')">
      <div class="y-modal__container" @click.stop>
        <div class="y-modal__header">
          <slot name="header">default header</slot>
        </div>

        <div class="y-modal__body">
          <slot name="body">default body</slot>
        </div>

        <div class="y-modal__footer">
          <slot name="footer">
            <y-button @click="$emit('close')">确定</y-button>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.y-modal__mask {
  position: fixed;
  z-index: 9998;
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
  padding: 20px 30px;
  background-color: $layout-background-gray;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.y-modal__header {
  color: $gray-08;
  h3 {
    margin-top: 0;
  }
}

.y-modal__body {
  margin: 20px 0;
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
