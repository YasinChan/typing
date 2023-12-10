<script setup lang="ts">
import YModal from '@/components/ui/Modal.vue';
import { inject, reactive, watch } from 'vue';
import YInput from '@/components/ui/Input.vue';
import YButton from '@/components/ui/Button.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import {
  getUserInfo,
  postLogin,
  postLogout,
  postRegister,
  postVerifyAnswer,
  updatePasswordWithAnswer
} from '@/request';
import YImage from '@/components/ui/Image.vue';
import { EMAIL_REG, PASSWORD_REG, USERNAME_REG } from '@/common/reg';

import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

const obj = reactive({
  showLogin: false,
  forgetModal: false,
  userName: '',
  password: '',
  userNameError: '',
  passwordError: '',
  emailError: '',
  confirmPassword: '',
  email: '',
  confirmPasswordError: '',
  disable: false,
  currentType: 'login', // register
  userName1: '',
  userName1Error: '',
  question: '',
  answer: '',
  answerError: '',
  unDisable: false, // 用户名查询按钮
  asDisable: false, // 答案回复按钮
  upDisable: false, // 确认重置密码按钮
  canSetNewPassword: false,
  newPassword: '',
  newPasswordError: ''
});

const message: any = inject('message');

const reset = () => {
  obj.userName = '';
  obj.password = '';
  obj.confirmPassword = '';
  obj.confirmPasswordError = '';
  obj.email = '';
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

watch(
  () => obj.email,
  () => {
    obj.disable = false;
    obj.emailError = '';
  }
);

watch(
  () => obj.userName1,
  () => {
    obj.userName1Error = '';
  }
);
watch(
  () => obj.answer,
  () => {
    obj.answerError = '';
  }
);

watch(
  () => obj.newPassword,
  () => {
    obj.newPasswordError = '';
  }
);

const userStore = useUserStore();
const { profile } = storeToRefs(userStore);

function verifyUserName() {
  if (!USERNAME_REG.test(obj.userName)) {
    obj.userNameError = '用户名只能包含至少一位数字、字母、中文、- 或 _ ';
    return false;
  }
  return true;
}
function verifyPassword() {
  if (!PASSWORD_REG.test(obj.password)) {
    obj.passwordError = '密码只能包含至少六位数字或者字母';
    return false;
  }
  return true;
}

function verifyEmail() {
  if (!EMAIL_REG.test(obj.email)) {
    obj.emailError = '邮箱格式不正确';
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
  if (obj.email && !verifyEmail()) {
    return;
  }

  if (obj.confirmPassword !== obj.password) {
    obj.confirmPasswordError = '密码不一致';
    return;
  }
  obj.confirmPasswordError = '';
  obj.emailError = '';

  postRegister({
    userName: obj.userName,
    password: obj.password,
    email: obj.email
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

const forgetPassword = () => {
  obj.forgetModal = true;
};

const findQuestionByUserName = () => {
  if (!obj.userName1) {
    obj.userName1Error = '请输入用户名';
    return;
  }
  obj.unDisable = true;
  getUserInfo({ userName: obj.userName1 })
    .then((res) => {
      message({ message: res.data?.message });
      obj.question = res.data?.result?.question;
    })
    .catch((err) => {
      obj.question = '';
      obj.canSetNewPassword = false;
      obj.userName1Error = err.response?.data?.message;
    })
    .finally(() => {
      obj.unDisable = false;
    });
};

const verifyAnswer = () => {
  if (!obj.answer) {
    obj.answerError = '请输入答案';
    return;
  }
  obj.asDisable = true;
  postVerifyAnswer({
    userName: obj.userName1,
    answer: obj.answer
  })
    .then((res) => {
      message({ message: res.data?.message });
      obj.canSetNewPassword = true;
    })
    .catch((err) => {
      obj.answerError = err.response?.data?.message;
    })
    .finally(() => {
      obj.asDisable = false;
    });
};

const updatePassword = () => {
  if (!PASSWORD_REG.test(obj.newPassword)) {
    obj.newPasswordError = '密码只能包含至少六位数字或者字母';
    return;
  }
  obj.upDisable = true;
  updatePasswordWithAnswer({
    userName: obj.userName1,
    answer: obj.answer,
    newPassword: obj.newPassword
  })
    .then((res) => {
      message({ message: res.data?.message });
      obj.forgetModal = false;
    })
    .catch((err) => {
      obj.newPasswordError = err.response?.data?.message;
    })
    .finally(() => {
      obj.upDisable = false;
    });
};
</script>

<template>
  <div class="y-auth flex-center">
    <y-drop-down v-if="'userName' in profile && profile.userName">
      <template #title>
        <div class="y-auth__login-img-wrap--login flex-center">
          <y-image class="y-auth__login-img" :src="profile.avatar" alt="user"></y-image>
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
        src="https://tf.yasinchan.com/aAo3RCau7RL9WsKC8I5TScUVmQaLLmA7/f83f561a35c2ef1b2ad3b4b1342ad249.png"
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
            <div class="y-change-login__remind">用户名中可包含数字、字母、中文、- 或 _</div>
            <y-input
              :max-length="25"
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
            <y-input
              v-model:value="obj.email"
              :error-text="obj.emailError"
              placeholder="邮箱（可选）"
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
              <div class="y-auth__forget-password" @click="forgetPassword">忘记密码</div>
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
  <Teleport to="body">
    <y-modal :show="obj.forgetModal" @close="obj.forgetModal = false">
      <template #header>
        <h3>忘记密码？</h3>
      </template>
      <template #body>
        <div class="y-forget-modal__container">
          <div class="y-forget-modal__remind">
            如果设置过密保问题，则可以通过密保问题找回密码，否则请联系管理员。
          </div>
          <div class="y-forget-modal__ask">用户名：</div>
          <div class="y-forget-modal__reply flex-center--y">
            <y-input
              v-model:value="obj.userName1"
              :error-text="obj.userName1Error"
              placeholder="你的用户名"
            ></y-input>
            <y-button :disable="obj.unDisable" size="small" @click="findQuestionByUserName"
              >查询</y-button
            >
          </div>
          <template v-if="obj.question">
            <div class="y-forget-modal__ask">{{ obj.question }}：</div>
            <div class="y-forget-modal__reply flex-center--y">
              <y-input
                v-model:value="obj.answer"
                :error-text="obj.answerError"
                placeholder="你的答案"
              ></y-input>
              <y-button :disable="obj.asDisable" size="small" @click="verifyAnswer">验证</y-button>
            </div>
          </template>
          <template v-if="obj.question && obj.canSetNewPassword">
            <div class="y-forget-modal__ask">重置密码：</div>
            <div class="y-forget-modal__reply flex-center--y">
              <y-input
                v-model:value="obj.newPassword"
                :error-text="obj.newPasswordError"
                placeholder="新的密码"
              ></y-input>
              <y-button :disable="obj.upDisable" size="small" @click="updatePassword"
                >确定</y-button
              >
            </div>
          </template>
        </div>
      </template>
      <template #footer>
        <div></div>
      </template>
    </y-modal>
  </Teleport>
</template>

<style lang="scss">
.y-auth {
  .y-drop-down__menu {
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
  border-radius: 10px;
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

.y-change-login__container {
  .y-input {
    padding-bottom: 10px;
  }
}
.y-change-login__remind {
  color: $gray-04;
  font-size: 12px;
  padding-bottom: 8px;
}

.y-auth__forget-password {
  color: $gray-06;
  font-size: 12px;
  cursor: pointer;
}

.y-forget-modal__remind {
  font-size: 14px;
  color: $gray-04;
  margin-bottom: 20px;
}

.y-forget-modal__ask {
  font-size: 14px;
  color: $gray-06;
  padding: 10px 0 4px;
}
.y-forget-modal__reply {
  justify-content: space-between;
  .y-input {
    width: 100%;
  }
  .y-button {
    margin-left: 10px;
  }
}
</style>
