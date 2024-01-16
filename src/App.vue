<script setup lang="ts">
import { reactive, provide, onMounted, ref, nextTick } from 'vue';
import { KEY_CODE_ENUM } from '@/config/key';

// components
import Message from '@/components/ui/Message.vue';
import Auth from '@/components/Auth.vue';
import YModal from '@/components/ui/Modal.vue';
import ListItem from '@/components/ui/ListItem.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import SuggestModal from '@/components/SuggestModal.vue';

// utils
import { setTheme, getTheme } from '@/common/theme';

// stores
import { useUserStore } from '@/store/user';
import { useConfigStore } from '@/store/config';
import { storeToRefs } from 'pinia';

// svg
import IcoMessage from '@/assets/svg/message.svg';
import IcoCapsLock from '@/assets/svg/caps-lock.svg';
import IcoClose from '@/assets/svg/close.svg';
import IcoRanking from '@/assets/svg/ranking.svg';

const suggestModalRef = ref<InstanceType<typeof SuggestModal>>();
const userStore = useUserStore();
userStore.setProfile();
userStore.setConfig();
const useConfig = useConfigStore();

const { config } = storeToRefs(userStore);
const { onlyShowMain, capsLockOn } = storeToRefs(useConfig);

setTheme(getTheme());

const obj = reactive({
  showRemind: true,
  showSuggest: false,
  showChangeFontModal: false,
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
  confirmClose: () => {},
  confirm: () => {}
});

provide('message', (obj: any) => {
  showMessage(obj);
});

provide('confirm', (obj: any) => {
  showConfirmModal(obj);
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

function changeTheme() {
  const currentTheme = getTheme();
  currentTheme === 'light' ? setTheme('dark') : setTheme('light');
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
  confirmClose = () => true,
  confirm = () => true
}) {
  obj.confirmTitle = title;
  obj.confirmContent = content;
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

async function suggestClick() {
  obj.showSuggest = true;
  await nextTick();
  if (suggestModalRef.value) {
    suggestModalRef.value.showSuggest();
  }
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
  <header>
    <div class="y-info" :class="[onlyShowMain ? 'y-info__disabled' : '']">
      <a href="/" class="y-info__title main-color">Typing</a>
    </div>

    <Transition name="menu">
      <div class="y-menu" v-show="!onlyShowMain">
        <router-link to="/leaderboard" class="y-menu__item y-menu__item--no-line flex-center--y">
          <IcoRanking></IcoRanking>
        </router-link>
        <router-link to="/" class="y-menu__item y-menu__item--active">限时模式</router-link>
        <!--        <router-link to="/words" class="y-menu__item">词/成语模式</router-link>-->
        <router-link to="/quote" class="y-menu__item">计时模式</router-link>
        <router-link to="/custom" class="y-menu__item">自定义模式</router-link>
        <router-link to="/keyboard" class="y-menu__item y-menu__keyboard-test"
          >键盘测试</router-link
        >
        <y-drop-down>
          <template #title>
            <div class="y-menu__item">其他</div>
          </template>
          <template #menu>
            <div class="y-auth__menu">
              <div
                class="y-menu__change y-menu__change-font"
                @click="
                  () => {
                    obj.showChangeFontModal = true;
                  }
                "
              >
                切换字体
              </div>
              <div class="y-menu__change" @click="changeTheme">切换主题</div>
              <router-link to="/statement" class="y-menu__change">声明</router-link>
              <router-link to="/log" class="y-menu__change">更新日志</router-link>
            </div>
          </template>
        </y-drop-down>
        <div class="y-menu__item y-menu__item-auth y-menu__change">
          <auth></auth>
        </div>
      </div>
    </Transition>
  </header>

  <Transition name="menu">
    <div v-if="capsLockOn" class="y-app__caps-lock flex-center--y">
      <IcoCapsLock></IcoCapsLock>
      <span>大写开启</span>
    </div>
  </Transition>

  <router-view></router-view>

  <Transition name="menu">
    <Tooltip v-if="!onlyShowMain" class="y-submit-suggest" content="提出建议">
      <IcoMessage @click="suggestClick" class="y-submit-suggest__svg"></IcoMessage>
    </Tooltip>
  </Transition>
  <SuggestModal ref="suggestModalRef" v-if="obj.showSuggest"></SuggestModal>

  <YModal
    :show="obj.showChangeFontModal"
    @close="obj.showChangeFontModal = false"
    @confirm="obj.showChangeFontModal = false"
  >
    <template #header>
      <h3>选择字体</h3>
    </template>
    <template #body>
      <div class="y-change__container gray-08">
        <ListItem @click="useConfig.setCurrentFont('default')" class="y-font--default"
          >默认 字体 测试 TEST test</ListItem
        >
        <ListItem @click="useConfig.setCurrentFont('zpix')" class="y-font--zpix-min"
          >zpix 字体 测试 TEST test</ListItem
        >
        <ListItem
          @click="useConfig.setCurrentFont('zhankugaoduanhei')"
          class="y-font--zhankugaoduanhei-min"
          >zhankugaoduanhei 字体 测试 TEST test</ListItem
        >
      </div>
    </template>
  </YModal>
  <Message :type="obj.type" :message="obj.message" :visible="obj.visible"></Message>
  <YModal :show="obj.showConfirm" @close="obj.confirmClose" @confirm="obj.confirm">
    <template #header>
      <h3>{{ obj.confirmTitle }}</h3>
    </template>
    <template #body>
      <div class="y-change__container gray-08">
        {{ obj.confirmContent }}
      </div>
    </template>
  </YModal>
</template>

<style lang="scss">
.y-remind {
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  line-height: 30px;
  text-align: center;
  color: $label-white;
  font-weight: bold;
  background: $main-color-gradient;
  cursor: pointer;
  svg {
    fill: $label-white;
    width: 16px;
    margin-left: 20px;
  }
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
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
  background: $main-color-gradient;
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
  margin-left: 12px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: color 0.5s;
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
}
.y-menu__change {
  cursor: pointer;
  border-radius: 2px;
  padding: 10px 15px;
  display: block;
  transition: background 0.2s;
  color: inherit;
  &:hover {
    background: $layout-background-gray-hover;
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

.menu-enter-active,
.menu-leave-active {
  transition: all 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>
