<script lang="ts" setup>
import { computed, reactive, onMounted, watch, inject } from 'vue';
import { ColorPicker } from 'vue3-colorpicker';
import 'vue3-colorpicker/style.css';

// components
import Tooltip from '@/components/ui/Tooltip.vue';
import ListItem from '@/components/ui/ListItem.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';
import ThemeLabel from '@/components/ThemeLabel.vue';
import YInput from '@/components/ui/Input.vue';
import ThemeGallery from '@/components/ThemeGallery.vue';

// config
import type { ThemeType } from '@/config/theme';
import type { COLOR_TYPE } from '@/types';

// common
import { setTheme } from '@/common/theme';
import {
  darkenHexColor,
  lightenHexColor,
  getCustomCssValue,
  setCustomCssValue,
  removeAllCustomCssValue
} from '@/common/color';

// png
import favicon from '@/assets/favicon.png';

//svg
import IcoChange from '@/assets/svg/change.svg';
import IcoArrow from '@/assets/svg/arrow.svg';
import IcoMore from '@/assets/svg/more.svg';
import IcoSetting from '@/assets/svg/setting.svg';
import IcoTips from '@/assets/svg/tips.svg';

// store
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';
import { useUserStore } from '@/store/user';

// apis
import { createSuggest } from '@/request';

const useConfig = useConfigStore();
const userStore = useUserStore();
const { profile, getProvinceUser } = storeToRefs(userStore);

const confirm: any = inject('confirm');
const message: any = inject('message');
const state = reactive({
  themeInput: '',
  show: false,
  selectThemeType: '预设',
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
    if (val === '自定义') {
      let target = 'root';
      const mainColor = getCustomCssValue('--main-color', 'body');
      if (mainColor) {
        target = 'body';
      }
      state.mainColor = getCustomCssValue('--main-color', target);
      state.mainRedColor = getCustomCssValue('--main-red', target);
      state.backgroundGrayColor = getCustomCssValue('--background-gray', target);
      state.layoutBackgroundGrayColor = getCustomCssValue('--layout-background-gray', target);

      state.gray08Color = getCustomCssValue('--gray-08', target);
      state.gray06Color = getCustomCssValue('--gray-06', target);
      state.gray04Color = getCustomCssValue('--gray-04', target);
      state.gray02Color = getCustomCssValue('--gray-02', target);

      state.labelWhiteColor = getCustomCssValue('--label-white', target);
    }
  }
);

const COLOR_CSS_VAR_MAP = {
  mainColor: '--main-color',
  mainRedColor: '--main-red',
  backgroundGrayColor: '--background-gray',
  layoutBackgroundGrayColor: '--layout-background-gray',
  gray08Color: '--gray-08',
  gray06Color: '--gray-06',
  gray04Color: '--gray-04',
  gray02Color: '--gray-02',
  labelWhiteColor: '--label-white'
} as const;

(Object.keys(COLOR_CSS_VAR_MAP) as Array<keyof typeof COLOR_CSS_VAR_MAP>).forEach((key) => {
  watch(
    () => state[key],
    (val) => setCustomCssValue(COLOR_CSS_VAR_MAP[key], val)
  );
});

const replyName = computed(() => {
  if (profile.value?.userName) {
    return profile.value.userName;
  } else if (getProvinceUser.value) {
    return getProvinceUser.value;
  }
  return '';
});

function showModal(type: string = 'normal') {
  state.show = true;
  state.selectThemeType = type === 'normal' ? '预设' : type === 'gallery' ? '社区' : '自定义';
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

function saveCustomTheme() {
  confirm({
    title: '确认保存',
    content: '保存后将在「主题 → 社区」中展示，随后会根据投票情况进入预设主题。',
    confirmClose: () => {
      return true;
    },
    confirm: async () => {
      const customTheme: COLOR_TYPE = {
        MAIN_COLOR: state.mainColor,
        MAIN_RED: state.mainRedColor,
        BACKGROUND_COLOR: state.backgroundGrayColor,
        LAYOUT_BACKGROUND_COLOR: state.layoutBackgroundGrayColor,
        GRAY_08: state.gray08Color,
        GRAY_06: state.gray06Color,
        GRAY_04: state.gray04Color,
        GRAY_02: state.gray02Color,
        LABEL_WHITE: state.labelWhiteColor,
        THEME_INPUT: state.themeInput
      };
      const info = `%${JSON.stringify(customTheme)}%`;
      useConfig.setCustomThemeConfig(info);

      state.show = false;

      try {
        let params: any = {
          content: info
        };
        if (profile.value?.userName && profile.value?.userId) {
          params = {
            content: info,
            userId: profile.value?.userId,
            userName: profile.value?.userName
          };
        } else if (replyName.value) {
          params = {
            content: info,
            userName: replyName.value
          };
        }
        params['isTheme'] = true;
        params['canShow'] = true;
        await createSuggest(params);
        message({ message: '主题已保存并应用，可在「社区主题」查看' });
      } catch (error: any) {
        const msg = error.response?.data?.message;
        message({ message: msg, type: 'error' });
      }

      return true;
    }
  });
}

function toThemeList() {
  state.selectThemeType = '社区';
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
    :class-name="
      state.selectThemeType === '自定义'
        ? 'y-modal__theme'
        : state.selectThemeType === '社区'
        ? 'y-modal__theme-gallery'
        : ''
    "
  >
    <template #header>
      <h3>
        {{
          state.selectThemeType === '自定义'
            ? $t('customize_theme')
            : state.selectThemeType === '社区'
            ? '社区主题'
            : $t('select_pre_set_theme')
        }}
      </h3>
    </template>
    <template #body>
      <div class="y-modal__theme-setting" v-if="state.selectThemeType === '自定义'">
        <div class="y-theme-editor">
          <div class="y-theme-editor__intro">
            <strong>配色</strong>
            <p>左侧调整，右侧实时预览</p>
          </div>

          <section class="y-theme-editor__group">
            <div class="y-theme-editor__group-title">基础颜色</div>
            <div class="y-theme-editor__grid">
              <div class="y-theme-editor__field">
                <span class="y-theme-editor__label">
                  背景色
                  <Tooltip content="页面背景色"><IcoTips></IcoTips></Tooltip>
                </span>
                <color-picker
                  v-model:pureColor="state.backgroundGrayColor"
                  shape="circle"
                  format="hex"
                  :disable-history="true"
                  :disable-alpha="true"
                  :debounce="100"
                />
              </div>
              <div class="y-theme-editor__field">
                <span class="y-theme-editor__label">
                  布局色
                  <Tooltip content="弹框、下拉框、卡片等布局背景色">
                    <IcoTips></IcoTips>
                  </Tooltip>
                </span>
                <color-picker
                  v-model:pureColor="state.layoutBackgroundGrayColor"
                  shape="circle"
                  format="hex"
                  :disable-history="true"
                  :disable-alpha="true"
                  :debounce="100"
                />
              </div>
              <div class="y-theme-editor__field">
                <span class="y-theme-editor__label">主题色</span>
                <color-picker
                  v-model:pureColor="state.mainColor"
                  shape="circle"
                  format="hex"
                  :disable-history="true"
                  :disable-alpha="true"
                  :debounce="100"
                />
              </div>
              <div class="y-theme-editor__field">
                <span class="y-theme-editor__label">错误色</span>
                <color-picker
                  v-model:pureColor="state.mainRedColor"
                  shape="circle"
                  format="hex"
                  :disable-history="true"
                  :disable-alpha="true"
                  :debounce="100"
                />
              </div>
            </div>
          </section>

          <section class="y-theme-editor__group">
            <div class="y-theme-editor__group-title">
              文字颜色
              <Tooltip
                html="字体颜色一共有四种，对应右侧预览中的<br>输入中、已输入、未输入和底部提示四种<br>逐渐变亮或变暗的字体颜色。<br>浅色主题选深色文字，深色主题选浅色文字。"
              >
                <IcoTips></IcoTips>
              </Tooltip>
            </div>
            <div class="y-theme-editor__grid">
              <div class="y-theme-editor__field">
                <span class="y-theme-editor__label">主文字</span>
                <color-picker
                  v-model:pureColor="state.gray08Color"
                  shape="circle"
                  format="hex"
                  :disable-history="true"
                  :disable-alpha="true"
                  :debounce="100"
                />
              </div>
              <div class="y-theme-editor__field">
                <span class="y-theme-editor__label">次文字</span>
                <color-picker
                  v-model:pureColor="state.gray06Color"
                  shape="circle"
                  format="hex"
                  :disable-history="true"
                  :disable-alpha="true"
                  :debounce="100"
                />
              </div>
              <div class="y-theme-editor__field">
                <span class="y-theme-editor__label">辅助文字</span>
                <color-picker
                  v-model:pureColor="state.gray04Color"
                  shape="circle"
                  format="hex"
                  :disable-history="true"
                  :disable-alpha="true"
                  :debounce="100"
                />
              </div>
              <div class="y-theme-editor__field">
                <span class="y-theme-editor__label">弱化文字</span>
                <color-picker
                  v-model:pureColor="state.gray02Color"
                  shape="circle"
                  format="hex"
                  :disable-history="true"
                  :disable-alpha="true"
                  :debounce="100"
                />
              </div>
              <div class="y-theme-editor__field y-theme-editor__field--full">
                <span class="y-theme-editor__label">
                  标签文字
                  <Tooltip content="按钮、标签等控件上的文字颜色。">
                    <IcoTips></IcoTips>
                  </Tooltip>
                </span>
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
            <div class="y-theme-editor__auto">
              <span>自动生成文字层级</span>
              <div>
                <YButton size="small" @click="toDark">变暗</YButton>
                <YButton size="small" @click="toLight">变亮</YButton>
              </div>
            </div>
          </section>

          <section class="y-theme-editor__group">
            <div class="y-theme-editor__group-title">主题名称</div>
            <YInput
              v-model="state.themeInput"
              placeholder="给主题起个名字"
              :max-length="6"
            ></YInput>
          </section>

          <div class="y-theme-editor__actions">
            <YButton @click="saveCustomTheme" :disable="!state.themeInput">保存并使用</YButton>
            <button type="button" class="y-theme-editor__link" @click="toThemeList">
              去主题广场
            </button>
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
                <span
                  title="Typing | 一个简约风格的可自定义主题、可切换字体的打字记录和键盘测试网站。"
                  >Typing | 一个简约风格的可自定义主题、可切换字体的打字记录和键盘测试网站。</span
                >
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
            <div class="content-top">这里是预览界面</div>
            <div class="y-modal__theme-chrome-content">
              <div class="flex-center--y-between">
                <div class="y-info__title main-color">Typing</div>
                <div class="y-menu">
                  <div class="y-menu__item">限时模式</div>
                  <div class="y-menu__item y-menu__item--active router-link-active">计时模式</div>
                  <div class="y-menu__item">英文打字</div>
                  <div class="y-menu__item flex-center--y">
                    <IcoSetting></IcoSetting>
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
              <div class="theme-content__word-tips" style="margin-top: 100px">
                <p>*{{ $t('sentence.word_tip') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThemeGallery
        v-else-if="state.selectThemeType === '社区'"
        @customize="state.selectThemeType = '自定义'"
        @applied="state.show = false"
      />
      <div v-else class="y-theme__container gray-08">
        <ListItem @click="themeSet('dark')" class="flex-center--y-between">
          <span>深色模式</span>
          <ThemeLabel
            label-background-color="#30323d"
            background-color="#252733"
            red-color="#f64c4c"
            gray-color="#ffffff"
            main-color="#15c5ce"
          ></ThemeLabel>
        </ListItem>
        <ListItem @click="themeSet('light')" class="flex-center--y-between">
          <span>浅色模式</span>
          <ThemeLabel
            label-background-color="#ffffff"
            background-color="#f5f7f8"
            red-color="#f64c4c"
            gray-color="#1d2127"
            main-color="#15c5ce"
          ></ThemeLabel>
        </ListItem>
      </div>
    </template>
    <template #footer>
      <div class="y-theme__footer flex-center--y-between">
        <div class="y-theme__tabs">
          <YButton
            v-for="tab in ['预设', '自定义', '社区']"
            :key="tab"
            size="small"
            :theme="state.selectThemeType === tab ? 'default' : 'secondary'"
            @click="state.selectThemeType = tab"
            >{{ tab }}</YButton
          >
        </div>
        <YButton @click="state.show = false">{{ $t('confirm') }}</YButton>
      </div>
    </template>
  </YModal>
</template>
<style lang="scss">
.y-modal__theme.y-modal__container {
  width: 996px;
}
.y-modal__theme-gallery.y-modal__container {
  width: 780px;
}
.y-theme__tabs {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  color: #fff;
}
.y-theme-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 260px;
  max-height: 460px;
  overflow: auto;
  padding-right: 4px;
}
.y-theme-editor__intro {
  strong {
    display: block;
    color: $gray-08;
    font-size: 14px;
    font-weight: 500;
  }
  p {
    margin-top: 2px;
    color: $gray-06;
    font-size: 12px;
  }
}
.y-theme-editor__group-title {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 6px;
  color: $gray-06;
  font-size: 12px;
  font-weight: 500;
  svg {
    width: 12px;
    height: 12px;
    fill: $gray-06;
    cursor: pointer;
  }
}
.y-theme-editor__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 8px;
}
.y-theme-editor__field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-height: 32px;
  padding: 0 6px;
  border: 1px solid $border-hairline;
  border-radius: $radius-sm;
  background: $background-gray;
}
.y-theme-editor__field--full {
  grid-column: 1 / -1;
}
.y-theme-editor__label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: $gray-08;
  font-size: 12px;
  white-space: nowrap;
  svg {
    width: 12px;
    height: 12px;
    fill: $gray-06;
    cursor: pointer;
  }
}
.y-theme-editor__auto {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  color: $gray-06;
  font-size: 12px;
  > div {
    display: inline-flex;
    gap: 6px;
  }
}
.y-theme-editor__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 4px;
}
.y-theme-editor__link {
  padding: 0;
  border: 0;
  background: transparent;
  color: $accent-text;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}

.y-modal__theme-custom {
  width: 720px;
  height: 460px;
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
    fill: #fff;
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
  height: 100%;
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
  color: $accent-ink;
  font-weight: 500;
  background: $main-color;
  cursor: pointer;
  svg {
    fill: $accent-ink;
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
  color: $gray-06;
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
  color: $gray-06;
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
