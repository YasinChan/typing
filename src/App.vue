<script setup lang="ts">
import { setTheme, getTheme } from '@/common/theme';
import YModal from '@/components/ui/Modal.vue';
import { reactive, provide, onMounted } from 'vue';
import Auth from '@/components/Auth.vue';
import Message from '@/components/ui/Message.vue';
import { useUserStore } from '@/store/user';
import { useConfigStore } from '@/store/config';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import YDropDown from '@/components/ui/DropDown.vue';

const router = useRouter();
const userStore = useUserStore();
userStore.setProfile();
userStore.setConfig();
const useConfig = useConfigStore();

const { config } = storeToRefs(userStore);
const { currentSystem, onlyShowMain } = storeToRefs(useConfig);

setTheme(getTheme());

const obj = reactive({
  showChangeFontModal: false,
  showChangeSystemModal: false,
  userName: '',
  password: '',
  userNameError: '',
  passwordError: '',
  type: '',
  message: '',
  visible: false,
  timeout: undefined as undefined | number
});

provide('message', (obj: any) => {
  showMessage(obj);
});

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('scroll', handleScroll);
  document.addEventListener('mouseover', handleMouseMove);
});

function handleKeyDown() {
  console.log('----------', 'handleKeyDown', 1, '----------cyy log');
  useConfig.setOnlyShowMain(true);
}
function handleScroll() {
  console.log('----------', 'handleScroll', 3, '----------cyy log');
  useConfig.setOnlyShowMain(false);
}
function handleMouseMove() {
  console.log('----------', 'handleMouseMove', 4, '----------cyy log');
  useConfig.setOnlyShowMain(false);
}

const showMessage = ({ message = '', type = 'success', settimeout = 3000 }) => {
  clearTimeout(obj.timeout);
  // 在这个函数中，设置Message组件的message和show属性，
  // 以显示消息
  obj.message = message;
  obj.type = type;
  obj.visible = true;

  obj.timeout = setTimeout(() => {
    // 过一段时间后，隐藏消息
    obj.visible = false;
  }, settimeout);
};

const changeTheme = () => {
  const currentTheme = getTheme();
  currentTheme === 'light' ? setTheme('dark') : setTheme('light');
};

function changeSystem(system: string) {
  useConfig.setCurrentSystem(system);
}
</script>

<template>
  <div v-if="'showRemind' in config && config.showRemind" class="y-remind">{{ config.remind }}</div>
  <header>
    <div class="y-info" :class="[onlyShowMain ? 'y-info__disabled' : '']">
      <a href="/" class="y-info__title main-color">Typing</a>
    </div>

    <Transition name="menu">
      <div class="y-menu" v-show="!onlyShowMain">
        <router-link to="/" class="y-menu__item y-menu__item--active">计时模式</router-link>
        <router-link to="time-limit" class="y-menu__item">限时模式</router-link>
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
                v-if="
                  router.currentRoute.value.name === 'TimeKeep' ||
                  router.currentRoute.value.name === 'TimeLimit'
                "
                class="y-menu__change y-menu__change-font"
                @click="
                  () => {
                    obj.showChangeFontModal = true;
                  }
                "
              >
                切换字体
              </div>
              <div
                v-else-if="router.currentRoute.value.name === 'Keyboard'"
                class="y-menu__change y-menu__change-keyboard"
                @click="
                  () => {
                    useConfig.setKeyboardModalStatus(true);
                  }
                "
              >
                切换键盘
              </div>
              <div class="y-menu__change" @click="changeTheme">切换主题</div>
              <div class="y-menu__change" @click="obj.showChangeSystemModal = true">切换系统</div>
            </div>
          </template>
        </y-drop-down>
        <div class="y-menu__item y-menu__change">
          <auth></auth>
        </div>
      </div>
    </Transition>
  </header>

  <router-view></router-view>

  <Teleport to="body">
    <y-modal :show="obj.showChangeFontModal" @close="obj.showChangeFontModal = false">
      <template #header>
        <h3>选择字体</h3>
      </template>
      <template #body>
        <div class="y-change__container gray-08">
          <ul>
            <li @click="useConfig.setCurrentFont('default')" class="y-font--default">
              默认 字体 测试 TEST test
            </li>
            <li @click="useConfig.setCurrentFont('zpix')" class="y-font--zpix">
              zpix 字体 测试 TEST test
            </li>
            <li
              @click="useConfig.setCurrentFont('zhankugaoduanhei')"
              class="y-font--zhankugaoduanhei"
            >
              zhankugaoduanhei 字体 测试 TEST test
            </li>
            <li @click="useConfig.setCurrentFont('AlibabaPuHuiTi')" class="y-font--AlibabaPuHuiTi">
              AlibabaPuHuiTi 字体 测试 TEST test
            </li>
          </ul>
        </div>
      </template>
    </y-modal>
  </Teleport>
  <Teleport to="body">
    <y-modal
      :show="obj.showChangeSystemModal"
      @close="obj.showChangeSystemModal = false"
      @confirm="obj.showChangeSystemModal = false"
    >
      <template #header>
        <h3>选择系统</h3>
      </template>
      <template #body>
        <div class="y-change__container gray-08">
          <ul>
            <li @click="changeSystem('win')" :class="currentSystem === 'win' ? 'active' : ''">
              Windows
            </li>
            <li @click="changeSystem('mac')" :class="currentSystem === 'mac' ? 'active' : ''">
              Mac
            </li>
          </ul>
        </div>
      </template>
    </y-modal>
  </Teleport>
  <Teleport to="body">
    <message :type="obj.type" :message="obj.message" :visible="obj.visible"></message>
  </Teleport>
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
    font-weight: bold;
    position: relative;
    &::after {
      width: 30px;
    }
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
  font-family: $font-en;
  font-weight: 600;
  color: $gray-08;
  font-size: 18px;
  letter-spacing: 1px;
}
.y-main {
  margin: 100px;
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
