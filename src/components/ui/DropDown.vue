<script setup lang="ts">
import { ref, nextTick, reactive } from 'vue';

const menuRef = ref<any>(null);
const obj = reactive({
  showMenu: false
});

nextTick().then(() => {
  document.addEventListener('click', (event) => {
    const targetElement: any = event.target;
    if (!targetElement.closest('.y-dorp-down--js')) {
      obj.showMenu = false;
    }
  });
});
</script>
<template>
  <div class="y-dorp-down y-dorp-down--js">
    <div class="y-dorp-down__title" @click.stop="obj.showMenu = !obj.showMenu">
      <slot name="title"></slot>
    </div>
    <div v-if="obj.showMenu" ref="menuRef" class="y-dorp-down__menu">
      <slot name="menu"></slot>
    </div>
  </div>
</template>
<style lang="scss">
.y-dorp-down {
  position: relative;
}
.y-dorp-down__menu {
  position: absolute;
  right: 0;
  background: $layout-background-gray;
  border-radius: 2px;
  box-shadow: 0px 0px 5px $layout-background-gray;
  color: $gray-06;
}
</style>
