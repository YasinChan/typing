<script setup lang="ts">
import YModal from '@/components/ui/Modal.vue';
import { reactive, watch, inject, ref } from 'vue';
import YInput from '@/components/ui/Input.vue';
import YButton from '@/components/ui/Button.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import { postLogin, postLogout, postRegister } from '@/request/index';

import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

const USERNAME_REG = /^[\u4e00-\u9fff]|\w+$/;
const PASSWORD_REG = /^[a-zA-Z0-9]{6,}$/;

const submitInputRef = ref();
const obj = reactive({
  showLogin: false,
  userName: '',
  password: '',
  userNameError: '',
  passwordError: '',
  confirmPassword: '',
  confirmPasswordError: '',
  disable: false,
  currentType: 'login' // register
});

const message: any = inject('message');

const reset = () => {
  obj.userName = '';
  obj.password = '';
  obj.confirmPassword = '';
  obj.confirmPasswordError = '';
  obj.disable = false;
};

watch(
  () => obj.showLogin,
  (val) => {
    if (val === false) {
      reset();
    }
  }
);

watch(
  () => obj.userName,
  () => {
    obj.disable = false;
    obj.userNameError = '';
  }
);

watch(
  () => obj.password,
  () => {
    obj.disable = false;
    obj.passwordError = '';
  }
);

watch(
  () => obj.confirmPassword,
  () => {
    obj.disable = false;
    obj.confirmPasswordError = '';
  }
);

const userStore = useUserStore();

const { profile } = storeToRefs(userStore);

function verifyUserName() {
  if (!USERNAME_REG.test(obj.userName)) {
    obj.userNameError = '用户名需要至少一位数字、字母或下划线';
    return false;
  }
  return true;
}
function verifyPassword() {
  if (!PASSWORD_REG.test(obj.password)) {
    obj.passwordError = '密码需要至少六位数字或字母';
    return false;
  }
  return true;
}

const login = () => {
  obj.disable = true;
  if (!verifyUserName()) {
    return;
  }
  if (!verifyPassword()) {
    return;
  }

  obj.userNameError = '';
  obj.passwordError = '';

  postLogin({
    userName: obj.userName,
    password: obj.password
  })
    .then(function (response) {
      message({ message: response.data?.message });
      setTimeout(() => {
        location.replace('/user/' + response.data?.result?.info?.userId);
      }, 500);
    })
    .catch(function (error) {
      const msg = error.response?.data?.message;
      message({ message: msg, type: 'error' });
      obj.disable = false;
    });
};

const register = () => {
  obj.disable = true;
  if (!verifyUserName()) {
    return;
  }
  if (!verifyPassword()) {
    return;
  }

  if (obj.confirmPassword !== obj.password) {
    obj.confirmPasswordError = '密码不一致';
    return;
  }
  obj.confirmPasswordError = '';

  postRegister({
    userName: obj.userName,
    password: obj.password
  })
    .then((res) => {
      message({ message: res.data?.message });
      obj.currentType = 'login';
      obj.disable = false;
    })
    .catch((err) => {
      const msg = err.response?.data?.message;
      message({ message: msg, type: 'error' });
      obj.disable = false;
    });
};

const logout = () => {
  postLogout()
    .then(function (response) {
      message({ message: response.data?.message });
      setTimeout(() => {
        location.reload();
      }, 500);
    })
    .catch(function (err) {
      const msg = err.response?.data?.message;
      message({ message: msg, type: 'error' });
    });
};

const passwordEnter = () => {
  if (obj.currentType === 'login') {
    login();
  }
};
</script>

<template>
  <div class="y-auth flex-center">
    <y-drop-down v-if="'userName' in profile && profile.userName">
      <template #title>
        <div class="y-auth__login-img-wrap--login flex-center">
          <img class="y-auth__login-img" :src="profile.avatar" alt="user" />
        </div>
      </template>
      <template #menu>
        <div class="y-auth__menu">
          <router-link
            :to="{ name: 'User', params: { id: profile.userId } }"
            class="y-auth__menu-item"
            >{{ 'userName' in profile ? profile.userName : '' }}</router-link
          >
          <div @click="logout" class="y-auth__menu-item">登出</div>
        </div>
      </template>
    </y-drop-down>
    <div
      v-else
      @click="
        () => {
          obj.showLogin = true;
        }
      "
      class="y-auth__login-img-wrap flex-center"
    >
      <img
        class="y-auth__login-img"
        src="https://tf.yasinchan.com/cSmuMHMW0t4vnb8UTNO5RcSAYChr1DBL/22f1196f825298281376608459bfa7fe.webp"
        alt="user"
      />
    </div>
  </div>
  <Teleport to="body">
    <y-modal :show="obj.showLogin" @close="obj.showLogin = false">
      <template #header>
        <h3>{{ obj.currentType === 'register' ? '注册' : '登录' }}</h3>
      </template>
      <template #body>
        <div class="y-change-login__container">
          <template v-if="obj.currentType === 'register'">
            <y-input
              v-model:value="obj.userName"
              :error-text="obj.userNameError"
              placeholder="用户名"
            ></y-input>
            <y-input
              v-model:value="obj.password"
              :error-text="obj.passwordError"
              @keydown.enter="passwordEnter"
              placeholder="密码"
            ></y-input>
            <y-input
              v-model:value="obj.confirmPassword"
              @keydown.enter="register"
              :error-text="obj.confirmPasswordError"
              placeholder="确认密码"
            ></y-input>
          </template>
          <template v-else>
            <form id="login-form" action="POST" @submit.prevent="login">
              <y-input
                v-model:value="obj.userName"
                :error-text="obj.userNameError"
                name="UserName"
                placeholder="用户名"
              ></y-input>
              <y-input
                v-model:value="obj.password"
                :error-text="obj.passwordError"
                name="Password"
                type="password"
                @keydown.enter="passwordEnter"
                placeholder="密码"
              ></y-input>
            </form>
          </template>
        </div>
      </template>
      <template #footer>
        <div class="y-auth__footer flex-center--y">
          <y-button form="login-form" v-if="obj.currentType === 'login'" :disable="obj.disable"
            >登录</y-button
          >
          <y-button v-else :disable="obj.disable" @click="register">注册</y-button>
          <span
            style="font-size: 14px"
            class="y-auth__footer-change main-color"
            @click="
              obj.currentType === 'register'
                ? (obj.currentType = 'login')
                : (obj.currentType = 'register')
            "
            >{{ obj.currentType === 'register' ? '去登录' : '去注册' }}</span
          >
        </div>
      </template>
    </y-modal>
  </Teleport>
</template>

<style lang="scss">
.y-auth {
  .y-dorp-down__menu {
    margin: 10px 0;
  }
}
.y-auth__login-img-wrap {
  width: 18px;
  height: 18px;
  border-radius: 10px;
}
.y-auth__login-img-wrap--login {
  width: 18px;
  height: 18px;
  border-radius: 10px;
  box-shadow: 0px 0px 5px $main-color;
  overflow: hidden;
  .y-auth__login-img {
    width: 100%;
    height: 100%;
    opacity: 0.6;
  }
}
.y-auth__login-img {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}
.y-auth__footer {
  justify-content: space-between;
}
.y-auth__menu {
  white-space: nowrap;
  font-size: 14px;
}
.y-auth__menu-item {
  border-radius: 2px;
  padding: 10px 15px;
  display: block;
  transition: background 0.2s;
  &:hover {
    background: $layout-background-gray-hover;
  }
}
.y-auth__footer-change {
  cursor: pointer;
}
</style>
