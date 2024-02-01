<script setup lang="ts">
import { ref, nextTick, reactive, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';

const menuRef = ref<any>(null);
const obj = reactive({
  showMenu: false
});

onMounted(async () => {
  await nextTick();
  onClickOutside(menuRef, closeMenu);
});
function closeMenu() {
  obj.showMenu = false;
}
defineExpose({
  closeMenu
});
</script>
<template>
  <div class="y-drop-down y-drop-down--js">
    <div class="y-drop-down__title" @click.stop="obj.showMenu = !obj.showMenu">
      <slot name="title"></slot>
    </div>
    <Transition name="drop-down">
      <div v-if="obj.showMenu" ref="menuRef" class="y-drop-down__menu">
        <slot name="menu"></slot>
      </div>
    </Transition>
  </div>
</template>
<style lang="scss">
.y-drop-down {
  position: relative;
}
.y-drop-down__menu {
  z-index: 1;
  position: absolute;
  right: 0;
  top: 28px;
  background: $layout-background-gray;
  border-radius: 2px;
  box-shadow: 0px 0px 5px $layout-background-gray;
  color: $gray-06;
}

.drop-down-enter-active,
.drop-down-leave-active {
  transition: all 0.1s ease;
}

.drop-down-enter-from,
.drop-down-leave-to {
  opacity: 0;
}
</style>
