<script setup lang="ts">
import { reactive, provide, onMounted, computed } from 'vue';
import { nanoid } from 'nanoid';

// components
import Message from '@/components/ui/Message.vue';
import Auth from '@/components/Auth.vue';
import YModal from '@/components/ui/Modal.vue';
import ListItem from '@/components/ui/ListItem.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import YTextarea from '@/components/ui/Textarea.vue';
import YButton from '@/components/ui/Button.vue';

// utils
import { setTheme, getTheme } from '@/common/theme';

// stores
import { useUserStore } from '@/store/user';
import { useConfigStore } from '@/store/config';
import { storeToRefs } from 'pinia';

// svg
import IcoMessage from '@/assets/svg/message.svg';

const userStore = useUserStore();
userStore.setProfile();
userStore.setConfig();
const useConfig = useConfigStore();

const { config, profile, getProvince } = storeToRefs(userStore);
const { onlyShowMain } = storeToRefs(useConfig);

setTheme(getTheme());

const obj = reactive({
  showRemind: true,
  showSuggest: false,
  isAnonymity: false,
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

const replyName = computed(() => {
  if (profile.value?.userName) {
    return profile.value.userName;
  } else {
    return `来自${getProvince.value}的用户 - ${nanoid(4)}`;
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('wheel', handleWheel);
  document.addEventListener('mousemove', handleMouseMove);
});

function handleKeyDown() {
  useConfig.setOnlyShowMain(true);
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
  confirmClose = () => {},
  confirm = () => {}
}) {
  obj.confirmTitle = title;
  obj.confirmContent = content;
  obj.showConfirm = true;
  obj.confirmClose = confirmClose;
  obj.confirm = confirm;
}
</script>

<template>
  <div
    v-if="'showRemind' in config && config.showRemind && obj.showRemind"
    @click="obj.showRemind = false"
    class="y-remind"
  >
    {{ config.remind }}
  </div>
  <header>
    <div class="y-info" :class="[onlyShowMain ? 'y-info__disabled' : '']">
      <a href="/" class="y-info__title main-color">Typing</a>
    </div>

    <Transition name="menu">
      <div class="y-menu" v-show="!onlyShowMain">
        <router-link to="/" class="y-menu__item y-menu__item--active">限时模式</router-link>
        <router-link to="/words" class="y-menu__item">词/成语模式</router-link>
        <router-link to="/quote" class="y-menu__item">句子模式</router-link>
        <router-link to="/custom" class="y-menu__item">自定义</router-link>
        <router-link to="/keyboard" class="y-menu__item y-menu__keyboard-test"
          >键盘测试</router-link
        >
        <y-drop-down>
          <template #title>
            <div class="y-menu__item">设置</div>
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
            </div>
          </template>
        </y-drop-down>
        <div class="y-menu__item y-menu__item-auth y-menu__change">
          <auth></auth>
        </div>
      </div>
    </Transition>
  </header>

  <router-view></router-view>

  <Transition name="menu">
    <Tooltip v-if="!onlyShowMain" class="y-submit-suggest" content="提出建议">
      <IcoMessage @click="obj.showSuggest = true" class="y-submit-suggest__svg"></IcoMessage>
    </Tooltip>
  </Transition>

  <YModal
    class-name="y-submit-suggest__modal"
    :show="obj.showSuggest"
    @close="obj.showSuggest = false"
    @confirm="obj.showSuggest = false"
  >
    <template #header>
      <h3>建议</h3>
    </template>
    <template #body>
      <div class="y-submit-suggest__tips">*各位提出的建议将会收集整理后发布在此。</div>
      <div class="gray-08">asdfasdf</div>
    </template>
    <template #footer>
      <div class="y-submit-suggest__reply gray-08">
        <p class="y-submit-suggest__reply-title">回复</p>
        <div class="y-submit-suggest__reply-name">
          发布者：
          <span @click="obj.isAnonymity = false" :class="{ active: !obj.isAnonymity }">{{
            replyName
          }}</span>
          <span>/</span>
          <span @click="obj.isAnonymity = true" :class="{ active: obj.isAnonymity }">匿名发布</span>
        </div>
        <YTextarea placeholder="请提出你的建议~"></YTextarea>
        <YButton style="margin-top: 10px" size="small">确定</YButton>
      </div>
    </template>
  </YModal>

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
        <ListItem @click="useConfig.setCurrentFont('zpix')" class="y-font--zpix"
          >zpix 字体 测试 TEST test</ListItem
        >
        <ListItem
          @click="useConfig.setCurrentFont('zhankugaoduanhei')"
          class="y-font--zhankugaoduanhei"
          >zhankugaoduanhei 字体 测试 TEST test</ListItem
        >
        <ListItem @click="useConfig.setCurrentFont('AlibabaPuHuiTi')" class="y-font--AlibabaPuHuiTi"
          >AlibabaPuHuiTi 字体 测试 TEST test</ListItem
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
  top: 0;
  left: 0;
  width: 100%;
  height: 30px;
  line-height: 30px;
  text-align: center;
  color: $main-orange;
  font-weight: bold;
  background: $main-color-gradient;
  cursor: pointer;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
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
  font-family: zhankugaoduanhei;
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
  &::after {
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

.y-submit-suggest.tooltip {
  position: fixed;
  right: 60px;
  bottom: 20px;
  .y-submit-suggest__svg {
    width: 30px;
    height: 30px;
    fill: $main-color;
    cursor: pointer;
    z-index: 999;
  }
}
.y-submit-suggest__modal {
  width: 800px;
  height: 60vh;
  .y-modal__footer {
    border-top: 1px solid $gray-02;
    padding-top: 10px;
  }
}
.y-submit-suggest__tips {
  color: $gray-04;
  font-size: 14px;
}
.y-submit-suggest__reply-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
}
.y-submit-suggest__reply-name {
  padding-bottom: 10px;
  font-size: 14px;
  span {
    margin-right: 10px;
    cursor: pointer;
    color: $gray-04;
    &.active {
      color: $main-color;
    }
  }
}
</style>
