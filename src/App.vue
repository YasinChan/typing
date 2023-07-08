<script setup lang="ts">
import { setTheme, getTheme } from '@/common/theme';
import YModal from '@/components/ui/Modal.vue';
import { reactive, provide } from 'vue';
import Auth from '@/components/Auth.vue';
import Message from '@/components/ui/Message.vue';
import { useUserStore } from '@/store/user';

// import pinyin from 'pinyin';

setTheme(getTheme());

const obj = reactive({
  showChangeFontModal: false,
  currentFont: '',
  userName: '',
  password: '',
  userNameError: '',
  passwordError: '',
  type: '',
  message: '',
  visible: false,
  test: '敬请期待！',
  testPinyin: [] as any
});

// obj.testPinyin = pinyin(obj.test);
console.log('obj.testPinyin', obj.testPinyin);

provide('message', (obj: any) => {
  showMessage(obj);
});

const showMessage = ({ message = '', type = 'success', settimeout = 3000 }) => {
  // 在这个函数中，设置Message组件的message和show属性，
  // 以显示消息
  obj.message = message;
  obj.type = type;
  obj.visible = true;

  setTimeout(() => {
    // 过一段时间后，隐藏消息
    obj.visible = false;
  }, settimeout);
};

const userStore = useUserStore();
userStore.setProfile();

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
        src="https://tf.yasinchan.com/2kAlQqg80xLzbmTmGmAaCXFzHSRVvojb/favicon.png"
      />
      <h1 class="y-info__title">Typing</h1>
    </div>

    <div class="y-menu">
      <div class="y-menu__item y-menu__item--active">计时模式</div>
      <div class="y-menu__item">限时模式</div>
      <div class="y-menu__item y-menu__keybord-test">键盘测试</div>
      <div
        class="y-menu__item y-menu__change"
        @click="
          () => {
            obj.showChangeFontModal = true;
          }
        "
      >
        切换字体
      </div>
      <div class="y-menu__item y-menu__change" @click="changeTheme">切换主题</div>
      <div class="y-menu__item y-menu__change">
        <auth></auth>
      </div>
    </div>
  </header>
  <main :class="'y-font--' + obj.currentFont">
    <p>
      <template v-for="item in obj.testPinyin">
        {{ item[0] + ' ' }}
      </template>
    </p>
    <h1>{{ obj.test }}</h1>
    <br />
    <br />
    <div>Test test Test test Test test Test test</div>
    <div>测试 测试 测试 测试 测试 测试 测试 测试 测试</div>
  </main>

  <Teleport to="body">
    <y-modal :show="obj.showChangeFontModal" @close="obj.showChangeFontModal = false">
      <template #header>
        <h3>选择字体</h3>
      </template>
      <template #body>
        <div class="y-change-font__container">
          <ul>
            <li @click="obj.currentFont = 'default'" class="y-font--default">
              默认 字体 测试 TEST test
            </li>
            <li @click="obj.currentFont = 'zpix'" class="y-font--zpix">zpix 字体 测试 TEST test</li>
            <li @click="obj.currentFont = 'zhankugaoduanhei'" class="y-font--zhankugaoduanhei">
              zhankugaoduanhei 字体 测试 TEST test
            </li>
            <li @click="obj.currentFont = 'AlibabaPuHuiTi'" class="y-font--AlibabaPuHuiTi">
              AlibabaPuHuiTi 字体 测试 TEST test
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
  font-family: zhankugaoduanhei;
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
    color: $main-color;
    font-weight: bold;
    position: relative;
    &::after {
      position: absolute;
      content: '';
      width: 40px;
      height: 2px;
      border-radius: 2px;
      background: $main-color;
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

.y-change-font__container {
  li {
    cursor: pointer;
  }
}
</style>
