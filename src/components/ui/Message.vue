<script setup lang="ts">
defineProps({
  type: {
    default: '',
    type: String
  },
  message: {
    default: '',
    type: String
  },
  visible: {
    default: false,
    type: Boolean
  }
});
</script>

<template>
  <Transition name="message">
    <Teleport to="body">
      <div class="y-message" v-if="visible" :class="[`y-message--${type}`]">{{ message }}</div>
    </Teleport>
  </Transition>
</template>

<style lang="scss">
.y-message {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 10px 18px;
  border-radius: $radius-full;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: $shadow-md;
  z-index: 9999;
  max-width: min(90vw, 520px);
}

.y-message--success {
  background: $main-color;
}

.y-message--error {
  background: $main-red;
}
.y-message--warn {
  background: $main-orange;
}

.message-enter-active,
.message-leave-active {
  transition: opacity 0.28s $ease-out, transform 0.28s $ease-out;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px);
}
</style>
