<script lang="ts" setup>
import { computed, reactive, onMounted, watch } from 'vue';
import { ColorPicker } from 'vue3-colorpicker';
import 'vue3-colorpicker/style.css';

// components
import ListItem from '@/components/ui/ListItem.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';

// config
import type { ThemeType } from '@/config/theme';

// common
import { setTheme } from '@/common/theme';
import { darkenHexColor, lightenHexColor } from '@/common/color';

// png
import favicon from '@/assets/favicon.png';

//svg
import IcoChange from '@/assets/svg/change.svg';
import IcoArrow from '@/assets/svg/arrow.svg';
import IcoMore from '@/assets/svg/more.svg';
import IcoSetting from '@/assets/svg/setting.svg';

const state = reactive({
  show: false,
  pureColor: 'red',
  selectThemeType: '自定义',
  mainColor: '',
  mainRedColor: '',
  backgroundGrayColor: '',
  layoutBackgroundGrayColor: '',
  gray08Color: '',
  gray06Color: '',
  gray04Color: '',
  gray02Color: '',
  labelWhiteColor: ''
});

onMounted(() => {});

watch(
  () => state.selectThemeType,
  (val) => {
    if (val !== '自定义') {
      state.mainColor = getCustomCssValue('--main-color');
      state.mainRedColor = getCustomCssValue('--main-red');
      state.backgroundGrayColor = getCustomCssValue('--background-gray');
      state.layoutBackgroundGrayColor = getCustomCssValue('--layout-background-gray');

      state.gray08Color = getCustomCssValue('--gray-08');
      state.gray06Color = getCustomCssValue('--gray-06');
      state.gray04Color = getCustomCssValue('--gray-04');
      state.gray02Color = getCustomCssValue('--gray-02');

      state.labelWhiteColor = getCustomCssValue('--label-white');
    }
  }
);

watch(
  () => state.mainColor,
  (val) => {
    setCustomCssValue('--main-color', val);
  }
);
watch(
  () => state.mainRedColor,
  (val) => {
    setCustomCssValue('--main-red', val);
  }
);
watch(
  () => state.backgroundGrayColor,
  (val) => {
    setCustomCssValue('--background-gray', val);
  }
);
watch(
  () => state.layoutBackgroundGrayColor,
  (val) => {
    setCustomCssValue('--layout-background-gray', val);
  }
);
watch(
  () => state.gray08Color,
  (val) => {
    setCustomCssValue('--gray-08', val);
  }
);
watch(
  () => state.gray06Color,
  (val) => {
    setCustomCssValue('--gray-06', val);
  }
);
watch(
  () => state.gray04Color,
  (val) => {
    setCustomCssValue('--gray-04', val);
  }
);
watch(
  () => state.gray02Color,
  (val) => {
    setCustomCssValue('--gray-02', val);
  }
);
watch(
  () => state.labelWhiteColor,
  (val) => {
    setCustomCssValue('--label-white', val);
  }
);

function getCustomCssValue(value: string) {
  const rootElement = document.documentElement;
  const computedStyle = window.getComputedStyle(rootElement);
  const customColorValue = computedStyle.getPropertyValue(value);
  return customColorValue;
}
function setCustomCssValue(css: string, value: string) {
  const body = document.body;
  body.style.setProperty(css, value);
}
function removeCustomCssValue(value: string) {
  const body = document.body;
  body.style.removeProperty(value);
}
function removeAllCustomCssValue() {
  removeCustomCssValue('--main-color');
  removeCustomCssValue('--main-red');
  removeCustomCssValue('--background-gray');
  removeCustomCssValue('--layout-background-gray');
  removeCustomCssValue('--gray-08');
  removeCustomCssValue('--gray-06');
  removeCustomCssValue('--gray-04');
  removeCustomCssValue('--gray-02');
  removeCustomCssValue('--label-white');
}

function showModal() {
  state.show = true;
}

function themeSet(type: ThemeType) {
  switch (type) {
    case 'light':
      removeAllCustomCssValue();
      setTheme('light');
      break;
    case 'dark':
      removeAllCustomCssValue();
      setTheme('dark');
      break;
    default:
      break;
  }
}

function toDark() {
  state.gray06Color = darkenHexColor(state.gray08Color, 0.4);
  state.gray04Color = darkenHexColor(state.gray08Color, 0.6);
  state.gray02Color = darkenHexColor(state.gray08Color, 0.75);
}
function toLight() {
  state.gray06Color = lightenHexColor(state.gray08Color, 0.4);
  state.gray04Color = lightenHexColor(state.gray08Color, 0.6);
  state.gray02Color = lightenHexColor(state.gray08Color, 0.75);
}

defineExpose({
  showModal
});
</script>
<template>
  <YModal
    :show="state.show"
    @close="state.show = false"
    @confirm="state.show = false"
    :class-name="state.selectThemeType !== '自定义' ? 'y-modal__theme' : ''"
  >
    <template #header>
      <h3>主题选择</h3>
    </template>
    <template #body>
      <div class="y-modal__theme-setting" v-if="state.selectThemeType !== '自定义'">
        <div class="gray-08">
          <div class="flex-center--y">
            <span class="theme-setting__title">背景色</span>
            <color-picker
              v-model:pureColor="state.backgroundGrayColor"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="flex-center--y">
            <span class="theme-setting__title">布局色</span>
            <color-picker
              v-model:pureColor="state.layoutBackgroundGrayColor"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="flex-center--y">
            <span class="theme-setting__title">主题色</span>
            <color-picker
              v-model:pureColor="state.mainColor"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="flex-center--y">
            <span class="theme-setting__title">错误颜色</span>
            <color-picker
              v-model:pureColor="state.mainRedColor"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="flex-center--y">
            <span class="theme-setting__title">主字体颜色</span>
            <color-picker
              v-model:pureColor="state.gray08Color"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="theme-setting__second">
            <span class="theme-setting__title main-color">自动生成</span>
            <div>
              <YButton size="small" @click="toDark">变暗</YButton>
              <YButton size="small" @click="toLight">变亮</YButton>
            </div>
          </div>
          <div class="theme-setting__second flex-center--y">
            <span class="theme-setting__title">字体颜色1</span>
            <color-picker
              v-model:pureColor="state.gray06Color"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="theme-setting__second flex-center--y">
            <span class="theme-setting__title">字体颜色2</span>
            <color-picker
              v-model:pureColor="state.gray04Color"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="theme-setting__second flex-center--y">
            <span class="theme-setting__title">字体颜色3</span>
            <color-picker
              v-model:pureColor="state.gray02Color"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="flex-center--y">
            <span class="theme-setting__title">标签字体颜色</span>
            <color-picker
              v-model:pureColor="state.labelWhiteColor"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
        </div>
        <div class="y-modal__theme-custom">
          <div class="y-modal__theme-chrome-header">
            <div class="y-modal__theme-chrome-header-control">
              <div class="header-control">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="header-control__tag">
                <img :src="favicon" alt="" />
                <span>Typing | 一个简约风格的打字测试网站</span>
              </div>
            </div>
            <div class="header-control__line">
              <div class="header-control__line-left">
                <IcoArrow></IcoArrow>
                <IcoArrow></IcoArrow>
                <IcoChange></IcoChange>
              </div>
              <div class="header-control__line-bar">https://typing.yasinchan.com</div>
              <IcoMore></IcoMore>
            </div>
          </div>
          <div class="y-modal__theme-chrome-content-wrap">
            <div class="content-top">这里是样式模板</div>
            <div class="y-modal__theme-chrome-content">
              <div class="flex-center--y-between">
                <div class="y-info__title main-color">Typing</div>
                <div class="y-menu">
                  <div class="y-menu__item y-menu__item--active router-link-active">限时模式</div>
                  <div class="y-menu__item">计时模式</div>
                  <div class="y-menu__item">自定义模式</div>
                  <div class="y-menu__item flex-center--y">
                    <IcoSetting></IcoSetting>
                    <div class="y-drop-down__menu">
                      <div class="y-auth__menu">
                        <div class="y-menu__change y-menu__change-font">切换字体</div>
                        <div class="y-menu__change">切换主题</div>
                        <div class="y-menu__change">声明</div>
                        <div class="y-menu__change">更新日志</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="theme-content__word">
                <div>
                  <span class="is-input">世界上有两条路，一条</span
                  ><span class="is-wrong">有形</span
                  ><span class="is-input">的横着</span
                  >供人前行徘徊或倒退，一条无形的竖着供灵魂升入天堂或下地狱。只有在横着的路上踏遍荆棘而无悔，方可在竖着的路上与云霞为伍。
                </div>
                <div class="theme-content__word-input">世界上有两条路，一条油性的横着</div>
              </div>
              <div class="theme-content__word-info">
                —— <span>《额尔古纳河右岸》节选</span> -
                <span>迟子建</span>
              </div>
              <div class="theme-content__word-tips">
                <p>*键入过程中，按下键盘左上角 Esc 键可随时结束输入进度。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="y-theme__container gray-08">
        <ListItem @click="themeSet('dark')" class="flex-center--y-between">
          <span>深色模式</span>
          <div class="y-theme__color y-theme__color--dark flex-center--y">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </ListItem>
        <ListItem @click="themeSet('light')" class="flex-center--y-between">
          <span>浅色模式</span>
          <div class="y-theme__color y-theme__color--light flex-center--y">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </ListItem>
      </div>
    </template>
    <template #footer>
      <div class="flex-center--y-between">
        <YButton
          @click="
            state.selectThemeType === '自定义'
              ? (state.selectThemeType = '通用')
              : (state.selectThemeType = '自定义')
          "
          >{{ state.selectThemeType }}</YButton
        >
        <YButton @click="state.show = false">确定</YButton>
      </div>
    </template>
  </YModal>
</template>
<style lang="scss">
.y-modal__theme.y-modal__container {
  width: 996px;
}
.y-theme__color {
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  height: 24px;

  span {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.4);
    margin: 4px;
  }
  &.y-theme__color--dark {
    background: #252733;
    span:nth-child(1) {
      background: #f64c4c;
    }
    span:nth-child(2) {
      background: rgba(255, 255, 255, 0.85);
    }
    span:nth-child(3) {
      background: #15c5ce;
    }
  }
  &.y-theme__color--light {
    background: #f5f7f8;
    span:nth-child(1) {
      background: #f64c4c;
    }
    span:nth-child(2) {
      background: #1d2127;
    }
    span:nth-child(3) {
      background: #15c5ce;
    }
  }
}

.y-modal__theme-setting {
  display: flex;
  justify-content: space-between;
  color: #fff;
}
.theme-setting__title {
  width: 100px;
  font-size: 14px;
  line-height: 30px;
}
.theme-setting__second {
  margin-left: 20px;
  button {
    margin-right: 10px;
  }
}

.y-modal__theme-custom {
  width: 720px;
  border-radius: 6px;
  background: rgb(43, 43, 43);
  overflow: hidden;
}
.y-modal__theme-chrome-header {
  height: 60px;
}
.y-modal__theme-chrome-header-control {
  display: flex;
}
.header-control {
  margin-left: 10px;
  margin-top: 8px;
  span {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 4px;
    &:nth-child(1) {
      background: #ff0000;
    }
    &:nth-child(2) {
      background: #ffff00;
    }
    &:nth-child(3) {
      background: #00ff00;
    }
  }
}
.header-control__tag {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  background: rgb(60, 60, 60);
  width: 160px;
  height: 25px;
  margin-top: 5px;
  margin-left: 6px;
  display: flex;
  align-items: center;
  overflow: hidden;
  img {
    width: 18px;
    margin-left: 6px;
    margin-right: 4px;
  }
  span {
    font-size: 12px;
    white-space: nowrap;
    @include limit-line(1);
    width: 120px;
    display: inline-block;
  }
}
.header-control__line {
  background: rgb(60, 60, 60);
  height: 30px;
  width: 100%;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  svg {
    fill: $label-white;
  }
}
.header-control__line-left {
  display: flex;
  svg {
    width: 14px;
    height: 14px;
    margin-right: 10px;
    &:nth-child(2) {
      transform: rotate(180deg);
    }
  }
}
.header-control__line-bar {
  width: 620px;
  height: 24px;
  line-height: 24px;
  border-radius: 20px;
  background: rgb(43, 43, 43);
  font-size: 12px;
  padding: 0 10px;
}

.y-modal__theme-chrome-content-wrap {
  display: flex;
  position: relative;
  background: $background-gray;
}
.content-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  text-align: center;
  color: $label-white;
  font-weight: bold;
  background: $main-color;
  cursor: pointer;
  svg {
    fill: $label-white;
    width: 16px;
    margin-left: 20px;
  }
}
.y-modal__theme-chrome-content {
  transform: scale(0.9);
  padding: 0 10px;
}
.theme-content__word {
  position: relative;
  line-height: 70px;
  user-select: none;
  font-size: 18px;
  color: $gray-04;
  margin: 30px 10px;
  .is-input {
    color: $gray-06;
  }
  .is-wrong {
    color: $main-red;
  }
}
.theme-content__word-input {
  position: absolute;
  top: 30px;
  line-height: 70px;
  display: inline-block;
  width: 100%;
  color: $gray-08;
  &:after {
    content: '';
    position: absolute;
    display: block;
    width: 100%;
    height: 1px;
    bottom: 20px;
    background: $main-color;
  }
}
.theme-content__word-info {
  text-align: right;
  color: $gray-04;
  margin: 10px;
}
.theme-content__word-tips {
  color: $gray-02;
  font-size: 16px;
  line-height: 30px;
  height: 24px;
  text-align: center;
  margin: 10px;
}
</style>
