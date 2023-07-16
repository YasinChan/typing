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
    <div class="y-message" v-if="visible" :class="[`y-message--${type}`]">{{ message }}</div>
  </Transition>
</template>

<style lang="scss">
.y-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateY(0);
  padding: 10px 20px;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  transition: opacity 0.3s;
  z-index: 9999;
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
  transition: all 0.5s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
