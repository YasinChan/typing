<script setup lang="ts">
import { reactive, provide, onMounted, ref, nextTick } from 'vue';
import { KEY_CODE_ENUM } from '@/config/key';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
// @ts-ignore
import FontFaceObserver from 'fontfaceobserver';

// components
import Message from '@/components/ui/Message.vue';
import Auth from '@/components/Auth.vue';
import YModal from '@/components/ui/Modal.vue';
import ListItem from '@/components/ui/ListItem.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import SuggestModal from '@/components/SuggestModal.vue';
import ThemeModal from '@/components/ThemeModal.vue';

// utils
import { setTheme, getTheme } from '@/common/theme';

// stores
import { useUserStore } from '@/store/user';
import { useConfigStore } from '@/store/config';
import { storeToRefs } from 'pinia';

// svg
import IcoDonate from '@/assets/svg/donate.svg';
import IcoTranslate from '@/assets/svg/translate.svg';
import IcoMessage from '@/assets/svg/message.svg';
import IcoCapsLock from '@/assets/svg/caps-lock.svg';
import IcoClose from '@/assets/svg/close.svg';
import IcoRanking from '@/assets/svg/ranking.svg';
import IcoSetting from '@/assets/svg/setting.svg';
import IcoGithub from '@/assets/svg/github.svg';
import IcoEmail from '@/assets/svg/email.svg';
import IcoIntroduce from '@/assets/svg/introduce.svg';
import IcoTheme from '@/assets/svg/theme.svg';
import IcoFont from '@/assets/svg/font.svg';
import IcoStatement from '@/assets/svg/statement.svg';
import IcoLog from '@/assets/svg/log.svg';
import IcoDocument from '@/assets/svg/document.svg';

// types
import type { SuggestItem } from '@/types';
import YButton from '@/components/ui/Button.vue';

// common
import YStorage from '@/common/YStorage';

const suggestModalRef = ref<InstanceType<typeof SuggestModal>>();
const themeModalRef = ref<InstanceType<typeof ThemeModal>>();
const authRef = ref<InstanceType<typeof Auth>>();
const userStore = useUserStore();
userStore.setProfile();
userStore.setConfig();
const useConfig = useConfigStore();
const router = useRouter();
const { locale, t } = useI18n();

const { config } = storeToRefs(userStore);
const { onlyShowMain, capsLockOn } = storeToRefs(useConfig);

setTheme(getTheme());

const obj = reactive({
  showRemind: true,
  showSuggest: false,
  showThemeSelect: false,
  showChangeFontModal: false,
  showDonate: false,
  userName: '',
  password: '',
  userNameError: '',
  passwordError: '',
  type: '',
  message: '',
  visible: false,
  timeout: undefined as undefined | number,
  showConfirm: false,
  confirmTitle: '',
  confirmContent: '',
  confirmOk: t('confirm'),
  confirmCancel: t('cancel'),
  confirmClose: () => {},
  confirm: () => {}
});

provide('message', (obj: any) => {
  showMessage(obj);
});

provide('confirm', (obj: any) => {
  showConfirmModal(obj);
});

provide('suggestClick', (obj: any) => {
  suggestClick(obj);
});

provide('changeTheme', (obj: any) => {
  changeTheme(obj);
});

provide('triggerShowLogin', () => {
  authRef.value?.triggerShowLogin();
});

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('wheel', handleWheel);
  document.addEventListener('mousemove', handleMouseMove);
});

function handleKeyDown(e: KeyboardEvent) {
  if (e.code === KEY_CODE_ENUM['ESCAPE']) {
    useConfig.setIsEscape(true);
  }
  if (e.code === KEY_CODE_ENUM['CAPS_LOCK']) {
    useConfig.setCapsLockOn(true);
  }
  useConfig.setOnlyShowMain(true);
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.code === KEY_CODE_ENUM['ESCAPE']) {
    useConfig.setIsEscape(false);
  }
  if (e.code === KEY_CODE_ENUM['CAPS_LOCK']) {
    useConfig.setCapsLockOn(false);
  }
}

let scrolled = 0;
function handleWheel(event: any) {
  scrolled += event.deltaY;
  if (Math.abs(scrolled) >= 20) {
    useConfig.setOnlyShowMain(false);
    scrolled = 0;
  }
}

let initialX: number | null = null;
let initialY: number | null = null;
function handleMouseMove(event: any) {
  if (initialX === null) {
    initialX = event.clientX;
    initialY = event.clientY;
  } else {
    const deltaX = Math.abs(event.clientX - (initialX as number));
    const deltaY = Math.abs(event.clientY - (initialY as number));

    if (deltaX >= 20 || deltaY >= 20) {
      useConfig.setOnlyShowMain(false);

      initialX = event.clientX;
      initialY = event.clientY;
    }
  }
}

async function changeTheme(type: string = 'normal') {
  obj.showThemeSelect = true;
  await nextTick();
  if (themeModalRef.value) {
    themeModalRef.value.showModal(type);
  }
}

function changeFont() {
  obj.showChangeFontModal = true;
}

// function preloadFont(url: string) {
//   const link = document.createElement('link');
//   link.rel = 'preload';
//   link.as = 'font';
//   link.href = url;
//   link.crossOrigin = '';
//   document.head.appendChild(link);
// }

function listenFont(name: string) {
  if (name === 'default') {
    showMessage({ message: '默认字体加载成功！' });
    return;
  }
  showMessage({ message: '"' + name + '"' + ' 字体加载中...', timeout: 8000 });
  const myFont = new FontFaceObserver(name, {});
  myFont.load(null, 8000).then(
    function () {
      showMessage({ message: '"' + name + '"' + ' 字体加载成功！' });
    },
    function () {
      showMessage({ message: '"' + name + '"' + ' 字体加载失败！', type: 'error' });
    }
  );
}

function setCurrentFont(type: string) {
  listenFont(type);
  useConfig.setCurrentFont(type);
}

function showMessage({ message = '', type = 'success', timeout = 3000 }) {
  clearTimeout(obj.timeout);
  // 在这个函数中，设置Message组件的message和show属性，
  // 以显示消息
  obj.message = message;
  obj.type = type;
  obj.visible = true;

  obj.timeout = setTimeout(() => {
    // 过一段时间后，隐藏消息
    obj.visible = false;
  }, timeout);
}

function showConfirmModal({
  title = '',
  content = '',
  ok = t('confirm'),
  cancel = t('cancel'),
  confirmClose = () => true,
  confirm = () => true
}) {
  obj.confirmTitle = title;
  obj.confirmContent = content;
  obj.confirmOk = ok;
  obj.confirmCancel = cancel;
  obj.showConfirm = true;
  obj.confirmClose = () => {
    const close = confirmClose();
    if (close) {
      obj.showConfirm = false;
    }
  };
  obj.confirm = () => {
    const close = confirm();
    if (close) {
      obj.showConfirm = false;
    }
  };
}

async function suggestClick(info?: SuggestItem | MouseEvent) {
  obj.showSuggest = true;
  await nextTick();
  if (suggestModalRef.value) {
    suggestModalRef.value.showSuggest();
    if (info) {
      suggestModalRef.value.activeSetFirstSuggest(info as SuggestItem);
    }
  }
}

function changeLocale() {
  const l = locale.value;
  if (l === 'zh') {
    locale.value = 'en';
  } else {
    locale.value = 'zh';
  }
  YStorage.set('Y_STORAGE', {
    locale: locale.value
  });
}
</script>

<template>
  <div
    v-if="'showRemind' in config && config.showRemind && obj.showRemind"
    @click="obj.showRemind = false"
    class="y-remind flex-center--y-center"
  >
    <span>
      {{ config.remind }}
    </span>
    <IcoClose></IcoClose>
  </div>
  <div class="y-mobile-show">
    <div class="y-info" :class="[onlyShowMain ? 'y-info__disabled' : '']">
      <a href="/" class="y-info__title main-color">Typing</a>
    </div>
    <h1>一个简约风格的可自定义主题、可切换字体的打字记录和键盘测试网站。</h1>
    <h2>欢迎使用电脑端访问该页面，体验 Typing 的更多功能！</h2>
    <img src="https://file.yasinchan.com/MCOD5rboejy8aB14T97iybJsYbPt2oAV/2272970956.png" alt="" />
    <img src="https://file.yasinchan.com/OuP7VwJmVyGF8SVYI1GBAf64w0vkR9VF/741427767.png" alt="" />
    <img src="https://file.yasinchan.com/mWeNzOLyIAIqhDdjxeOWdIoKvbQIBmfo/2343042681.png" alt="" />
    <img src="https://file.yasinchan.com/3mJW6cYdhhonSKsrLNIrPRescfb9202i/1757293763.png" alt="" />
  </div>
  <div class="y-app">
    <header>
      <div class="y-info" :class="[onlyShowMain ? 'y-info__disabled' : '']">
        <a href="/" class="y-info__title main-color">Typing</a>
      </div>

      <Transition name="menu">
        <div class="y-menu" v-show="!onlyShowMain">
          <router-link
            to="/game"
            class="y-menu__item"
            :class="{
              'y-menu__item--active': $route.name === 'Game' || $route.name === 'GameRoom',
              'y-menu__item--blink': $route.name !== 'Game' && $route.name !== 'GameRoom'
            }"
            >{{ $t('game_mode') }}</router-link
          >
          <router-link to="/" class="y-menu__item">{{ $t('limit_mode') }}</router-link>
          <!--        <router-link to="/words" class="y-menu__item">词/成语模式</router-link>-->
          <router-link to="/quote" class="y-menu__item">{{ $t('time_mode') }}</router-link>
          <router-link to="/custom" class="y-menu__item">{{ $t('custom_mode') }}</router-link>
          <a href="/keyboard" class="y-menu__item y-menu__keyboard-test">{{ $t('keyboard') }}</a>
          <router-link to="/leaderboard" class="y-menu__item">{{ $t('leaderboard') }}</router-link>
          <YDropDown>
            <template #title>
              <div class="y-menu__item flex-center--y">
                <IcoSetting></IcoSetting>
              </div>
            </template>
            <template #menu>
              <div class="y-auth__menu">
                <div class="y-menu__change y-menu__change-font" @click="changeFont">
                  {{ $t('change_font') }}
                </div>
                <div class="y-menu__change" @click="changeTheme('normal')">
                  {{ $t('change_theme') }}
                </div>
                <div class="y-menu__change" @click="suggestClick">
                  {{ $t('suggestions_and_feedback') }}
                </div>
              </div>
            </template>
          </YDropDown>
          <div class="y-menu__item" @click="changeLocale">
            <IcoTranslate></IcoTranslate>
          </div>
          <div class="y-menu__item y-menu__item-auth">
            <auth ref="authRef"></auth>
          </div>
        </div>
      </Transition>
    </header>

    <router-view></router-view>

    <Transition name="menu">
      <footer v-show="!onlyShowMain" class="flex-center">
        <a
          class="flex-center--y y-app__footer"
          href="https://github.com/YasinChan/typing"
          target="_blank"
        >
          <IcoGithub></IcoGithub>
          <span>{{ $t('source_code') }}</span>
        </a>
        <a
          class="flex-center--y y-app__footer"
          href="https://yasinchan.com/tags/typing/"
          target="_blank"
        >
          <IcoDocument></IcoDocument>
          <span>{{ $t('technology') }}</span>
        </a>
        <a
          class="flex-center--y y-app__footer"
          href="https://www.bilibili.com/video/BV1ci4y1s73q"
          target="_blank"
        >
          <IcoIntroduce></IcoIntroduce>
          <span>{{ $t('introduction') }}</span>
        </a>
        <router-link to="/statement" class="flex-center--y cursor-pointer y-app__footer">
          <IcoStatement></IcoStatement>
          <span>{{ $t('statement') }}</span>
        </router-link>
        <router-link to="/log" class="flex-center--y cursor-pointer y-app__footer">
          <IcoLog></IcoLog>
          <span>{{ $t('log') }}</span>
        </router-link>
        <span class="flex-center--y cursor-pointer y-app__footer" @click="changeTheme('normal')">
          <IcoTheme></IcoTheme>
          <span>{{ $t('theme') }}</span>
        </span>
        <span class="flex-center--y cursor-pointer y-app__footer" @click="changeFont">
          <IcoFont></IcoFont>
          <span>{{ $t('font') }}</span>
        </span>
        <span class="flex-center--y cursor-pointer y-app__footer" @click="suggestClick">
          <IcoMessage></IcoMessage>
          <span>{{ $t('suggestions_and_feedback') }}</span>
        </span>
        <span class="flex-center--y cursor-pointer y-app__footer" @click="obj.showDonate = true">
          <IcoDonate></IcoDonate>
          <span>{{ $t('appreciate') }}</span>
        </span>
      </footer>
    </Transition>
  </div>

  <Transition name="menu">
    <div v-if="capsLockOn" class="y-app__caps-lock flex-center--y">
      <IcoCapsLock></IcoCapsLock>
      <span>大写开启</span>
    </div>
  </Transition>

  <Transition name="menu">
    <Tooltip
      v-if="!onlyShowMain"
      class="y-submit-suggest"
      :content="$t('suggestions_and_feedback')"
    >
      <IcoMessage @click="suggestClick" class="y-submit-suggest__svg"></IcoMessage>
    </Tooltip>
  </Transition>
  <SuggestModal
    ref="suggestModalRef"
    v-if="obj.showSuggest"
    @open-theme-modal="changeTheme('custom')"
  ></SuggestModal>
  <ThemeModal ref="themeModalRef" v-if="obj.showThemeSelect"></ThemeModal>

  <YModal :show="obj.showDonate" @close="obj.showDonate = false">
    <template #header>
      <h3>{{ $t('appreciate') }}</h3>
    </template>
    <template #body>
      <div class="y-change__container gray-08">
        <div class="y-donate__text">
          {{ $t('appreciate_text') }}
        </div>
        <img
          style="width: 100%"
          src="https://file.yasinchan.com/io7449MA6D2hjrzuh1Y8fAaqSP9imTi6/mm_facetoface_collect_qrcode_1744639832578.png"
          alt=""
        />
      </div>
    </template>
    <template #footer>
      <YButton @click="obj.showDonate = false">{{ $t('pay') }}</YButton>
      <YButton theme="secondary" style="margin-left: 20px" @click="obj.showDonate = false; suggestClick()">{{
        $t('not_good')
      }}</YButton>
    </template>
  </YModal>
  <YModal
    :show="obj.showChangeFontModal"
    @close="obj.showChangeFontModal = false"
    @confirm="obj.showChangeFontModal = false"
  >
    <template #header>
      <h3>{{ $t('select_theme') }}</h3>
    </template>
    <template #body>
      <div class="y-change__container gray-08">
        <ListItem @click="setCurrentFont('default')" class="y-font--default"
          >默认 字体 测试 TEST test</ListItem
        >
        <ListItem @click="setCurrentFont('zpix')" class="y-font--zpix-min"
          >zpix 字体 测试 TEST test</ListItem
        >
        <ListItem @click="setCurrentFont('zhankugaoduanhei')" class="y-font--zhankugaoduanhei-min"
          >站酷高端黑 字体 测试 TEST test</ListItem
        >
        <ListItem @click="setCurrentFont('deyihei')" class="y-font--deyihei-min"
          >得意黑 字体 测试 TEST test</ListItem
        >
        <ListItem @click="setCurrentFont('alibabapuhuiti')" class="y-font--alibabapuhuiti-min"
          >阿里巴巴普惠体 字体 测试 TEST test</ListItem
        >
      </div>
    </template>
  </YModal>
  <Message :type="obj.type" :message="obj.message" :visible="obj.visible"></Message>
  <YModal
    :show="obj.showConfirm"
    :z-index="10"
    @close="obj.confirmClose"
    @confirm="obj.confirm"
    :show-cancel="true"
  >
    <template #header>
      <h3>{{ obj.confirmTitle }}</h3>
    </template>
    <template #body>
      <div class="y-change__container gray-08">
        {{ obj.confirmContent }}
      </div>
    </template>
    <template #footer>
      <YButton @click="obj.confirm">{{ obj.confirmOk }}</YButton>
      <YButton style="margin-left: 20px" theme="secondary" @click="obj.confirmClose">
        {{ obj.confirmCancel }}
      </YButton>
    </template>
  </YModal>
</template>

<style lang="scss">
.y-remind {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  line-height: 30px;
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
.y-app {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
}
.y-mobile-show {
  color: $gray-08;
  h1 {
    margin-top: 30px;
    font-size: 22px;
  }
  h2 {
    color: $gray-06;
    font-size: 20px;
    margin-top: 20px;
  }
  img {
    width: 100%;
    margin-top: 40px;
  }
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
}
main,
.y-main {
  flex: 1;
}
footer {
  font-size: 14px;
  a,
  > span {
    margin-right: 20px;
  }
  svg {
    width: 14px;
    height: 14px;
    fill: $gray-02;
    margin-right: 4px;
  }
  span {
    color: $gray-02;
  }
}
.y-app__caps-lock {
  position: fixed;
  z-index: 1;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  color: $label-white;
  font-size: 14px;
  font-weight: bold;
  background: $main-color;
  border-radius: 2px;
  cursor: pointer;
  padding: 0 8px;
  svg {
    margin-right: 4px;
    fill: $label-white;
    width: 20px;
  }
}
.y-info {
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease;
}
.y-info__disabled {
  opacity: 0.3;
}
.y-info__logo {
  width: 30px;
  height: 30px;
}
.y-info__title {
  font-family: zhankugaoduanhei-min;
  margin-left: 6px;
  display: inline-block;
  font-weight: bold;
  font-size: 18px;
  line-height: 30px;
}

.y-menu {
  display: flex;
  align-items: center;
  color: $gray-08;
}
.y-menu__item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: color 0.5s;
  svg {
    transition: all 0.5s;
  }
  &:hover {
    color: $main-color;
    svg {
      fill: $main-color;
    }
  }
  svg {
    fill: $gray-08;
    width: 18px;
    height: 18px;
  }
  &:not(.y-menu__item--no-line)::after {
    transition: all 0.1s;
    position: absolute;
    content: '';
    width: 0;
    height: 2px;
    border-radius: 2px;
    background: $main-color;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
  }
  &.router-link-active {
    color: $main-color;
    position: relative;
    svg {
      fill: $main-color;
    }
    &::after {
      width: 30px;
    }
  }
  &.y-menu__item-auth {
    padding: 0;
  }
  &.y-menu__item--active {
    color: $main-color;
  }
}
.y-menu__item--blink {
  animation: title-blink 0.8s infinite alternate;
}
.y-menu__change {
  cursor: pointer;
  border-radius: 2px;
  padding: 10px 15px;
  display: block;
  transition: all 0.2s;
  color: inherit;
  &:hover {
    background-color: $main-color;
    color: $label-white;
  }
  &.y-menu__change--active {
    background-color: $main-color;
    color: $label-white;
  }
}

main {
  margin: 100px;
  //font-family: $font-en;
  font-weight: 600;
  color: $gray-08;
  font-size: 18px;
  letter-spacing: 1px;
}
.y-main {
  margin: 100px auto;
  color: $gray-08;
}

.y-change__container {
  li {
    cursor: pointer;
  }
}

.y-app__footer {
  span {
    transition: all 0.2s ease;
  }
  svg {
    transition: all 0.2s ease;
  }
  &:hover {
    span {
      color: $main-color;
    }
    svg {
      fill: $main-color;
    }
  }
}
.y-donate__text {
  margin-bottom: 8px;
}

.menu-enter-active,
.menu-leave-active {
  transition: all 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

@keyframes title-blink {
  0% {
    text-shadow: none;
  }
  100% {
    text-shadow: 0 0 4px #fff, 0 0 8px #fff, 0 0 12px #fff, 0 0 16px $main-color;
  }
}
</style>
