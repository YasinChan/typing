<script lang="ts" setup>
import { computed, reactive, onMounted, inject } from 'vue';
import { ColorPicker } from 'vue3-colorpicker';
import 'vue3-colorpicker/style.css';

// components
import ListItem from '@/components/ui/ListItem.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';

// config
import type { ThemeType } from '@/config/theme';

// utils
import { setTheme } from '@/common/theme';

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
  selectThemeType: '自定义'
});

function showModal() {
  state.show = true;
}

function themeSet(type: ThemeType) {
  switch (type) {
    case 'light':
      setTheme('light');
      break;
    case 'dark':
      setTheme('dark');
      break;
    default:
      break;
  }
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
      <div class="y-modal__theme-setting gray-08" v-if="state.selectThemeType !== '自定义'">
        <div class="">
          <div>
            <span>背景色</span>
            <color-picker
              v-model:pureColor="state.pureColor"
              shape="circle"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div>
            <span>主题色</span>
            <color-picker
              v-model:pureColor="state.pureColor"
              shape="circle"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div>
            <span>字体颜色</span>
            <color-picker
              v-model:pureColor="state.pureColor"
              shape="circle"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
              format="hex"
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
          <div class="y-modal__theme-chrome-content">
            <div class="flex-center--y-between">
              <div class="y-info__title main-color">Typing</div>
              <div class="y-menu">
                <div class="y-menu__item y-menu__item--active">限时模式</div>
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
                <span class="is-input">世界上有两条路，一条</span><span class="is-wrong">有形</span
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
}

.y-modal__theme-custom {
  width: 720px;
  border-radius: 6px;
  background: rgb(43, 43, 43);
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
.y-modal__theme-chrome-content {
  transform: scale(0.9);
  padding: 10px;
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
