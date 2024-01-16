<script setup lang="ts"></script>
<template>
  <div class="y-loading"></div>
</template>
<style lang="scss">
.y-loading {
  border: 3px solid $gray-06;
  border-top: 3px solid $main-color;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
