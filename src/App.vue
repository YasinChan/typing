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
    <div class="y-info">
      <img
        alt="Typing logo"
        class="y-info__logo"
        src="@/assets/favicon.png"
      />
      <h1 class="y-info__title">Typing</h1>
    </div>

    <div class="y-menu">
      <div class="y-menu__item y-menu__item--active">计时模式</div>
      <div class="y-menu__item">限时模式</div>
      <div class="y-menu__item y-menu__keybord-test">键盘测试</div>
      <div class="y-menu__item y-menu__change" @click="changeTheme">切换主题</div>
    </div>
  </header>
  <main>
    <div>Test Test Test</div>
    <div>测试 测试 测试</div>
  </main>
</template>

<style lang="scss">
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.y-info {
  display: flex;
  align-items: center;
}
.y-info__logo {
  width: 30px;
  height: 30px;
}
.y-info__title {
  font-family: $font-en;
  margin-left: 6px;
  display: inline-block;
  color: $gray-06;
  font-size: 16px;
  line-height: 30px;
}

.y-menu {
  display: flex;
  align-items: center;
  color: $gray-08;
}
.y-menu__item {
  margin-left: 12px;
  cursor: pointer;
  letter-spacing: 1px;
  &.y-menu__item--active {
    color: $primary-y-blue;
    font-weight: bold;
    position: relative;
    &::after {
      position: absolute;
      content: '';
      width: 40px;
      height: 2px;
      border-radius: 2px;
      background: $primary-y-blue;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
.y-menu__change {
  margin-left: 26px;
  color: $gray-04;
}

main {
  margin: 100px;
  font-family: $font-en;
  font-weight: 600;
  color: $gray-08;
  font-size: 18px;
  letter-spacing: 1px;
}
</style>
