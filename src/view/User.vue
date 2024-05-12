<script setup lang="ts">
import { reactive, watch, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

// api
import { getUserInfo, setPersonalInfo, updatePassword, getLeaderBoardByUserId } from '@/request';

// type
import type { LeaderBoardType } from '@/types';

// components
import YModal from '@/components/ui/Modal.vue';
import YInput from '@/components/ui/Input.vue';
import YImage from '@/components/ui/Image.vue';

// config
import { EMAIL_REG, PASSWORD_REG } from '@/common/reg';

// stores
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

// utils
import { generateAvatar } from '@/utils/generate-avatar';

const userStore = useUserStore();
const { profile, myUserId } = storeToRefs(userStore);

const message: any = inject('message');

const state = reactive({
  info: {
    avatar: '',
    userName: ''
  },
  showPasswordQuestion: false,
  showResetAvatar: false,
  showSetEmail: false,
  paramsId: '' as any,
  question: '' as any,
  answer: '' as any,
  email: '' as any,
  emailError: '' as any,
  oldPassword: '' as any,
  newPassword: '' as any,
  confirmNewPassword: '' as any,
  newPasswordError: '' as any,
  confirmNewPasswordError: '' as any,
  userTimeLeaderBoardInfo: [] as LeaderBoardType[],
  userCountdownLeaderBoardInfo: [] as LeaderBoardType[]
});

const router = useRouter();

const avatarUrl = computed(() => {
  return state.info.userName ? generateAvatar(state.info.userName) : '';
});

watch(
  () => router.currentRoute.value.params,
  (val) => {
    state.paramsId = val.id;
    getUserInfo({ userId: String(state.paramsId) }).then((res) => {
      state.info = res.data?.result;
    });
    getLeaderBoardByUserId({ id: String(state.paramsId) }).then((res) => {
      const userLeaderBoardInfo = res.data?.result?.leaderboard;
      state.userTimeLeaderBoardInfo = userLeaderBoardInfo.filter(
        (item: any) => item.type === 'time'
      );
      state.userCountdownLeaderBoardInfo = userLeaderBoardInfo.filter(
        (item: any) => item.type === 'countdown'
      );
      console.log('state.userTimeLeaderBoardInfo', state.userTimeLeaderBoardInfo);
      console.log('state.userCountdownLeaderBoardInfo', state.userCountdownLeaderBoardInfo);
    });
  },
  {
    immediate: true
  }
);
watch(
  profile,
  (val: any) => {
    state.question = val.question;
    state.answer = val.answer;
    state.email = val.email;
  },
  {
    immediate: true,
    deep: true
  }
);

function verifyPassword() {
  if (!PASSWORD_REG.test(state.newPassword)) {
    state.newPasswordError = '密码只能包含至少六位数字或者字母';
    return false;
  }
  return true;
}
const setPasswordQuestion = () => {
  state.showPasswordQuestion = true;
};
const setEmail = () => {
  state.showSetEmail = true;
};
const resetAvatar = () => {
  state.showResetAvatar = true;
};

const setPQ = () => {
  if (!state.question || !state.answer) {
    message({ message: '问题或答案不能为空', type: 'warn' });
    return;
  }
  setPersonalInfo({
    userId: state.paramsId,
    question: state.question,
    answer: state.answer
  }).then((res) => {
    message({ message: res.data?.message });
    userStore.setProfile();
  });
  state.showPasswordQuestion = false;
};

watch(
  () => state.email,
  () => {
    state.emailError = '';
  }
);

watch(
  () => state.showResetAvatar,
  () => {
    state.oldPassword = '';
    state.newPassword = '';
    state.confirmNewPassword = '';
    state.newPasswordError = '';
    state.confirmNewPasswordError = '';
  }
);
const setNewEmail = () => {
  if (!EMAIL_REG.test(state.email)) {
    state.emailError = '邮箱格式不正确';
    return;
  }
  state.emailError = '';

  if (!state.email) {
    message({ message: '邮箱不能为空', type: 'warn' });
    return;
  }
  setPersonalInfo({
    userId: state.paramsId,
    email: state.email
  }).then((res) => {
    message({ message: res.data?.message });
    userStore.setProfile();
  });
  state.showSetEmail = false;
};
const setResetAvatar = () => {
  if (!state.oldPassword || !state.newPassword || !state.confirmNewPassword) {
    message({ message: '密码不能为空', type: 'warn' });
    return;
  }
  if (!verifyPassword()) {
    return;
  }
  if (state.newPassword !== state.confirmNewPassword) {
    message({ message: '两次密码不一致', type: 'warn' });
    return;
  }
  updatePassword({
    oldPassword: state.oldPassword,
    newPassword: state.newPassword
  })
    .then((res) => {
      message({ message: res.data?.message });
      state.showResetAvatar = false;
      userStore.setProfile();
    })
    .catch((error) => {
      const msg = error.response?.data?.message;
      message({ message: msg, type: 'error' });
    });
};
</script>

<template>
  <div class="y-user y-main">
    <div class="y-user__info">
      <y-image class="y-user__image" :src="avatarUrl"></y-image>
      <div class="y-user__name-info">
        <div class="y-user__user-name">
          {{ state.info.userName }}
          <span class="y-user__user-status" v-if="myUserId == state.paramsId">已登录</span>
        </div>
        <div v-if="myUserId == state.paramsId && 'email' in profile" class="y-user__user-email">
          {{ profile.email }}
        </div>
      </div>
    </div>
    <div class="y-user__setting" v-if="myUserId == state.paramsId">
      <div class="y-user__setting-title">设置</div>
      <div class="y-user__setting-set">
        <div class="y-user__setting-set-item" @click="setPasswordQuestion">设置密保问题</div>
        <div class="y-user__setting-set-item" @click="setEmail">设置邮箱地址</div>
        <div class="y-user__setting-set-item" @click="resetAvatar">重置密码</div>
      </div>
    </div>
    <div
      class="y-user__leaderboard"
      v-if="state.userTimeLeaderBoardInfo || state.userCountdownLeaderBoardInfo"
    >
      <div class="y-user__leaderboard-title">打字记录</div>
      <div class="y-user__leaderboard-info">
        <div class="y-user__leaderboard-info-item" v-if="state.userTimeLeaderBoardInfo?.length">
          <div class="y-user__leaderboard-info-item-title">限时模式</div>
          <div class="y-user__leaderboard-info-item-list">
            <table class="y-user__leaderboard-info-item-table">
              <thead>
                <tr>
                  <td>速度</td>
                  <td>准确率</td>
                  <td>时长</td>
                  <td class="y-leader-board__header-finish-time">完成时间</td>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="y-leader-board-item"
                  v-for="item in state.userTimeLeaderBoardInfo"
                  :key="item.objectId"
                >
                  <td class="y-leader-board-item__wpm">{{ item.wpm }}</td>
                  <td class="y-leader-board-item__accuracy">{{ item.accuracy }}</td>
                  <td class="y-leader-board-item__duration">{{ item.duration }}</td>
                  <td class="y-leader-board-item__created-at">
                    {{ dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          class="y-user__leaderboard-info-item"
          v-if="state.userCountdownLeaderBoardInfo?.length"
        >
          <div class="y-user__leaderboard-info-item-title">计时模式</div>
          <div class="y-user__leaderboard-info-item-list">
            <table class="y-user__leaderboard-info-item-table">
              <thead>
                <tr>
                  <td>速度</td>
                  <td>准确率</td>
                  <td>时长</td>
                  <td class="y-leader-board__header-finish-time">完成时间</td>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="y-leader-board-item"
                  v-for="item in state.userCountdownLeaderBoardInfo"
                  :key="item.objectId"
                >
                  <td class="y-leader-board-item__wpm">{{ item.wpm }}</td>
                  <td class="y-leader-board-item__accuracy">{{ item.accuracy }}</td>
                  <td class="y-leader-board-item__duration">{{ item.duration }}</td>
                  <td class="y-leader-board-item__created-at">
                    {{ dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <YModal
    :show="state.showPasswordQuestion"
    @close="state.showPasswordQuestion = false"
    @confirm="setPQ"
  >
    <template #header>
      <h3>设置密保问题</h3>
    </template>
    <template #body>
      <div class="y-user-pq__container">
        <div class="y-user-pq__remind">请设置一个问题与答案，方便在你忘记密码时找回密码，如：</div>
        <div class="y-user-pq__eg">问：世界上最好的语言</div>
        <div class="y-user-pq__eg">答：PHP</div>
        <YInput class="y-user-pq__q" v-model="state.question" placeholder="你的问题"></YInput>
        <YInput class="y-user-pq__a" v-model="state.answer" placeholder="你的回答"></YInput>
      </div>
    </template>
  </YModal>
  <YModal :show="state.showResetAvatar" @close="state.showResetAvatar = false">
    <template #header>
      <h3>重置密码</h3>
    </template>
    <template #body> </template>
  </YModal>
  <YModal :show="state.showSetEmail" @close="state.showSetEmail = false" @confirm="setNewEmail">
    <template #header>
      <h3>设置邮箱地址</h3>
    </template>
    <template #body>
      <div class="y-user-set-email__container">
        <YInput
          :error-text="state.emailError"
          placeholder="设置邮箱地址"
          v-model="state.email"
        ></YInput>
      </div>
    </template>
  </YModal>
  <YModal
    :show="state.showResetAvatar"
    @close="state.showResetAvatar = false"
    @confirm="setResetAvatar"
  >
    <template #header>
      <h3>重置密码</h3>
    </template>
    <template #body>
      <div class="y-user-reset-password__container">
        <YInput placeholder="旧密码" v-model="state.oldPassword"></YInput>
        <YInput
          :error-text="state.newPasswordError"
          placeholder="新密码"
          v-model="state.newPassword"
        ></YInput>
        <YInput
          :error-text="state.confirmNewPasswordError"
          placeholder="确认新密码"
          v-model="state.confirmNewPassword"
        ></YInput>
      </div>
    </template>
  </YModal>
</template>

<style lang="scss">
.y-user {
  margin: 100px 0 !important;
}
.y-user__info {
  display: flex;
}
.y-user__image {
  width: 100px;
  height: 100px;
  border-radius: 2px;
  overflow: hidden;
}
.y-user__name-info {
  margin-left: 20px;
}
.y-user__user-name {
  font-size: 28px;
  font-weight: bold;
}
.y-user__user-status {
  font-size: 12px;
  border-radius: 2px;
  padding: 2px 5px;
  margin-left: 4px;
  border: 1px solid $gray-04;
  vertical-align: middle;
}

.y-user__setting,
.y-user__leaderboard {
  margin-top: 30px;
}
.y-user__setting-title,
.y-user__leaderboard-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
.y-user__setting-set {
  display: flex;
  font-size: 16px;
}
.y-user__setting-set-item {
  margin-right: 20px;
  cursor: pointer;
}
.y-user-pq__container {
  color: $gray-04;
  font-size: 14px;
  .y-input {
    padding-bottom: 10px;
  }
}
.y-user-pq__remind {
  color: $gray-06;
  margin-bottom: 5px;
}
.y-user-pq__q {
  margin-top: 10px;
}
.y-user-reset-password__container {
  .y-input {
    padding-bottom: 10px;
  }
}

.y-user__leaderboard-info-item-title {
  color: $gray-06;
  margin: 20px 0 10px;
  font-weight: bold;
}
.y-user__leaderboard-info-item-table {
  width: 100%;
  max-width: 800px;
  font-size: 14px;
  border-collapse: collapse;
  border-spacing: 0;
  td {
    padding: 4px 6px;
    white-space: nowrap;
    border-radius: 2px;
  }
  tbody {
    position: relative;
    tr:nth-child(2n + 1) {
      background-color: $layout-background-gray;
    }
  }
}
</style>
