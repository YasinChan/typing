<script setup lang="ts">
import { setTheme, getTheme } from '@/common/theme';
setTheme(getTheme());

const changeTheme = () => {
  const currentTheme = getTheme();
  currentTheme === 'light' ? setTheme('dark') : setTheme('light');
};
</script>

<template>
  <header>
    <img alt="Vue logo" class="Y-logo" src="@/assets/favicon.png" width="125" height="125" />
    <div class="Y-change" @click="changeTheme">切换主题</div>
  </header>
</template>

<style lang="scss">
.Y-change {
  color: $primary-y-blue;
  cursor: pointer;
}
</style>
