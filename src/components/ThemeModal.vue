<script lang="ts" setup>
import { computed, reactive, onMounted, watch, inject } from 'vue';
import { useRouter } from 'vue-router';
import { ColorPicker } from 'vue3-colorpicker';
import 'vue3-colorpicker/style.css';

// components
import Tooltip from '@/components/ui/Tooltip.vue';
import ListItem from '@/components/ui/ListItem.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';
import ThemeLabel from '@/components/ThemeLabel.vue';
import YInput from '@/components/ui/Input.vue';

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
const router = useRouter();
const { profile, getProvinceUser } = storeToRefs(userStore);

const confirm: any = inject('confirm');
const message: any = inject('message');
const suggestClick: any = inject('suggestClick');
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
    if (val !== '预设') {
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
  state.selectThemeType = type === 'normal' ? '预设' : '自定义';
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
    content:
      '保存后将在「建议与反馈」（入口为页面右下角图标）中展示，随后将根据投票情况保存到预设主题中。',
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
          suggestClick({
            isTheme: true,
            down: 0,
            content: info,
            up: 0,
            canShow: true,
            userId: profile.value?.userId,
            userName: profile.value?.userName,
            createdAt: new Date().getTime()
          });
        } else if (replyName.value) {
          params = {
            content: info,
            userName: replyName.value
          };
          suggestClick({
            isTheme: true,
            down: 0,
            content: info,
            up: 0,
            canShow: true,
            userName: replyName.value,
            createdAt: new Date().getTime()
          });
        }
        params['isTheme'] = true;
        params['canShow'] = true;
        const res = await createSuggest(params);
        if (res.data?.message) {
          message({ message: res.data?.message });
        } else {
          message({ message: '发布成功' });
        }
      } catch (error: any) {
        const msg = error.response?.data?.message;
        message({ message: msg, type: 'error' });
      }

      return true;
    }
  });
}

function toThemeList() {
  router.replace({ query: { suggest_filter: 'theme' } });
  setTimeout(() => {
    state.show = false;
    suggestClick();
  }, 200);
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
    :class-name="state.selectThemeType === '自定义' ? 'y-modal__theme' : ''"
  >
    <template #header>
      <h3>
        {{
          state.selectThemeType === '自定义' ? $t('customize_theme') : $t('select_pre_set_theme')
        }}
      </h3>
    </template>
    <template #body>
      <div class="y-modal__theme-setting" v-if="state.selectThemeType === '自定义'">
        <div class="gray-08" style="max-width: 200px">
          <div class="flex-center--y">
            <div class="theme-setting__title">
              <span class="">背景色</span>
              <Tooltip content="页面背景色">
                <IcoTips></IcoTips>
              </Tooltip>
            </div>
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
            <div class="theme-setting__title">
              <span>布局色</span>
              <Tooltip content="布局背景色，如弹框、下拉框背景色，排行榜列表区分色">
                <IcoTips></IcoTips>
              </Tooltip>
            </div>
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
            <div class="theme-setting__title">
              <span>主字体颜色</span>
              <Tooltip
                html="字体颜色一共有四种，对应右侧预览界面中的<br>输入中、已输入、未输入和底部提示四种<br>逐渐变亮或变暗的字体颜色。<br>一般来说，整体是亮色主题可以选择深色的字体颜色，<br>反之选择浅色的主字体颜色。"
              >
                <IcoTips></IcoTips>
              </Tooltip>
            </div>
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
            <div class="theme-setting__title main-color">
              <span>自动生成</span>
              <Tooltip
                :html="`<p>这里其他三种颜色可以自动生成或者手动设置，<br>根据主题色是深还是浅，选择变暗或者变深。<br>一般来说，深色主题选择变暗，浅色主题选择变亮。</p>`"
              >
                <IcoTips></IcoTips>
              </Tooltip>
            </div>
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
            <div class="theme-setting__title">
              <span>标签字体颜色</span>
              <Tooltip content="按钮、标签等字体颜色。">
                <IcoTips></IcoTips>
              </Tooltip>
            </div>
            <color-picker
              v-model:pureColor="state.labelWhiteColor"
              shape="circle"
              format="hex"
              :disable-history="true"
              :disable-alpha="true"
              :debounce="100"
            />
          </div>
          <div class="main-color" style="margin-bottom: 10px">
            <div class="theme-setting__title">
              <span>为主题定个名称吧</span>
            </div>
            <YInput v-model="state.themeInput" placeholder="主题名称" :max-length="6"></YInput>
          </div>
          <YButton @click="saveCustomTheme" :disable="!state.themeInput">保存自定义设置</YButton>
          <div @click="toThemeList" class="theme-setting__title-click font-bold">
            点击此处查看用户已定义的主题，并为你喜欢的主题投票吧~
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
              <div class="theme-content__word-tips" style="margin-top: 100px">
                <p>*键入过程中，按下键盘左上角 Esc 键可随时结束输入进度。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      <div class="flex-center--y-between">
        <YButton
          @click="
            state.selectThemeType === '自定义'
              ? (state.selectThemeType = '预设')
              : (state.selectThemeType = '自定义')
          "
          >{{ state.selectThemeType === '自定义' ? '预设' : '自定义' }}</YButton
        >
        <YButton @click="state.show = false">{{ $t('confirm') }}</YButton>
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
  width: 120px;
  font-size: 14px;
  line-height: 30px;
  display: flex;
  align-items: center;
  svg {
    fill: $gray-06;
    cursor: pointer;
    width: 14px;
    margin-top: 2px;
    height: 14px;
    margin-left: 4px;
  }
}
.theme-setting__title-click {
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  color: $main-color;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
.theme-setting__tips {
  font-size: 12px;
  color: $gray-02;
  svg {
    width: 12px;
    height: 12px;
    fill: $main-color;
  }
}
.theme-setting__second {
  margin-left: 20px;
  button {
    margin-right: 10px;
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
