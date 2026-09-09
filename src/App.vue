<script setup lang="ts">
import { reactive, provide, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
import { KEY_CODE_ENUM } from '@/config/key';
import { useRouter, useRoute } from 'vue-router';
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
const route = useRoute();
const { locale, t } = useI18n();

const gameVisited = ref(!!(YStorage.get('Y_STORAGE') || {}).gameVisited);
watch(
  () => route.name,
  (name) => {
    if ((name === 'Game' || name === 'GameRoom') && !gameVisited.value) {
      gameVisited.value = true;
      YStorage.set('Y_STORAGE', { ...(YStorage.get('Y_STORAGE') || {}), gameVisited: true });
    }
  },
  { immediate: true }
);

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

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  document.removeEventListener('wheel', handleWheel);
  document.removeEventListener('mousemove', handleMouseMove);
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
  YStorage.set('Y_STORAGE', { ...(YStorage.get('Y_STORAGE') || {}), locale: locale.value });
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
      <a href="/" class="y-info__title main-color"><span class="y-info__cap">T</span>yping</a>
    </div>
    <h1>简约可玩的打字练习与键盘测试</h1>
    <p class="y-mobile-show__lead">
      限时、计时、自定义文本、键盘测试和多人 PK，实时统计速度与准确率。
    </p>
    <p class="y-mobile-show__hint">建议使用电脑端打开，获得完整打字体验。</p>
    <div class="y-mobile-show__shots">
      <img src="https://file.yasinchan.com/MCOD5rboejy8aB14T97iybJsYbPt2oAV/2272970956.png" alt="Typing 界面预览" />
      <img src="https://file.yasinchan.com/OuP7VwJmVyGF8SVYI1GBAf64w0vkR9VF/741427767.png" alt="打字结果预览" />
    </div>
  </div>
  <div class="y-app">
    <header>
      <div class="y-info" :class="[onlyShowMain ? 'y-info__disabled' : '']">
        <a href="/" class="y-info__title main-color"><span class="y-info__cap">T</span>yping</a>
      </div>

      <Transition name="menu">
        <div class="y-menu" v-show="!onlyShowMain">
          <nav class="y-menu__nav">
          <router-link
            to="/game"
            class="y-menu__item"
            :class="{
              'y-menu__item--active': $route.name === 'Game' || $route.name === 'GameRoom',
              'y-menu__item--blink':
                !gameVisited && $route.name !== 'Game' && $route.name !== 'GameRoom'
            }"
            >{{ $t('game_mode') }}</router-link
          >
          <router-link to="/" class="y-menu__item">{{ $t('limit_mode') }}</router-link>
          <!--        <router-link to="/words" class="y-menu__item">词/成语模式</router-link>-->
          <router-link to="/quote" class="y-menu__item">{{ $t('time_mode') }}</router-link>
          <router-link to="/custom" class="y-menu__item">{{ $t('custom_mode') }}</router-link>
          <a
            href="/keyboard"
            class="y-menu__item y-menu__keyboard-test"
            :class="{ 'y-menu__item--active': $route.name === 'TypingKeyboard' }"
            >{{ $t('keyboard') }}</a
          >
          <router-link to="/leaderboard" class="y-menu__item">{{ $t('leaderboard') }}</router-link>
          </nav>
          <div class="y-menu__tools">
          <YDropDown>
            <template #title>
              <div class="y-menu__icon flex-center--y">
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
          <Tooltip :content="locale === 'zh' ? 'English' : '中文'">
            <div class="y-menu__icon" @click="changeLocale">
              <IcoTranslate></IcoTranslate>
            </div>
          </Tooltip>
          <div class="y-menu__icon y-menu__item-auth">
            <auth ref="authRef"></auth>
          </div>
          </div>
        </div>
      </Transition>
    </header>

    <router-view></router-view>

    <Transition name="menu">
      <footer v-show="!onlyShowMain" class="flex-center">
        <div class="y-app__footer-group">
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
        </div>
        <div class="y-app__footer-divider"></div>
        <div class="y-app__footer-group">
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
        </div>
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
      <h3>{{ $t('select_font') }}</h3>
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
    :z-index="1100"
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
  height: 32px;
  line-height: 32px;
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
  min-height: calc(100vh - 44px);
}
.y-mobile-show {
  color: $gray-08;
  h1 {
    margin-top: 28px;
    font-size: 24px;
    line-height: 1.4;
  }
  .y-mobile-show__lead {
    margin-top: 12px;
    color: $gray-06;
    font-size: 15px;
    line-height: 1.7;
  }
  .y-mobile-show__hint {
    margin-top: 10px;
    color: $main-color;
    font-size: 14px;
    font-weight: 600;
  }
  .y-mobile-show__shots {
    margin-top: 28px;
    display: grid;
    gap: 16px;
  }
  img {
    width: 100%;
    border-radius: $radius-md;
    box-shadow: $shadow-md;
  }
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  gap: 16px;
  flex-wrap: wrap;
}
main,
.y-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
footer {
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding: 8px 0 4px;
  svg {
    width: 14px;
    height: 14px;
    fill: $gray-04;
    margin-right: 4px;
  }
  span {
    color: $gray-04;
  }
}
.y-app__footer-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.y-app__footer-divider {
  width: 1px;
  height: 12px;
  background: $gray-02;
  opacity: 0.7;
}
.y-app__caps-lock {
  position: fixed;
  z-index: 2;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  color: $label-white;
  font-size: 13px;
  font-weight: 700;
  background: $main-color;
  border-radius: $radius-full;
  padding: 6px 12px;
  box-shadow: $shadow-md;
  svg {
    margin-right: 4px;
    fill: $label-white;
    width: 18px;
  }
}
.y-info {
  display: flex;
  align-items: center;
  transition: opacity 0.3s $ease-out;
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
  display: inline-block;
  font-weight: bold;
  font-size: 20px;
  line-height: 30px;
}
.y-info__cap {
  display: inline-block;
  min-width: 1em;
  padding: 0 4px;
  margin-right: 3px;
  border: 1.5px solid currentColor;
  border-radius: 6px;
  line-height: 1.1;
  text-align: center;
  box-shadow: inset 0 -2px 0 0 currentColor;
  transition: box-shadow 0.12s $ease-out, transform 0.12s $ease-out;
}
.y-info__title:hover .y-info__cap {
  box-shadow: inset 0 0 0 0 currentColor;
  transform: translateY(2px);
}

.y-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  color: $gray-08;
}
.y-menu__nav {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  background: $layout-background-gray;
  border-radius: $radius-full;
  box-shadow: $shadow-sm;
}
.y-menu__tools {
  display: flex;
  align-items: center;
  gap: 4px;
}
.y-menu__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border-radius: $radius-full;
  cursor: pointer;
  letter-spacing: 0.5px;
  font-size: 13px;
  font-weight: 600;
  color: $gray-06;
  transition: color 0.2s $ease-out, background-color 0.2s $ease-out;
  &:hover {
    color: $main-color;
  }
  &.router-link-exact-active,
  &.y-menu__item--active {
    color: $label-white;
    background: $main-color;
  }
}
.y-menu__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  cursor: pointer;
  color: $gray-06;
  transition: color 0.2s $ease-out, background-color 0.2s $ease-out;
  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
  &:hover {
    color: $main-color;
    background: $layout-background-gray;
  }
  &.y-menu__item-auth {
    width: auto;
    min-width: 32px;
    padding: 0 2px;
  }
}
.y-menu__item--blink {
  animation: title-blink 0.8s infinite alternate;
}
.y-menu__change {
  cursor: pointer;
  border-radius: $radius-sm;
  padding: 8px 12px;
  display: block;
  transition: background-color 0.2s $ease-out, color 0.2s $ease-out;
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
  margin: 12px 8px;
  font-weight: 600;
  color: $gray-08;
  font-size: 20px;
  letter-spacing: 0.4px;
}
.y-main {
  margin: 12px auto;
  color: $gray-08;
}

.y-change__container {
  li {
    cursor: pointer;
  }
}

.y-app__footer {
  span {
    transition: color 0.2s $ease-out;
  }
  svg {
    transition: fill 0.2s $ease-out;
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
  transition: opacity 0.22s $ease-out, transform 0.22s $ease-out;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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
