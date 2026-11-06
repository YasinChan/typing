<script setup lang="ts">
import { reactive, watch, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

// api
import {
  getUserInfo,
  setPersonalInfo,
  updatePassword,
  getLeaderBoardByUserId,
  getSuggestByUserId
} from '@/request';

// type
import type { LeaderBoardType, SuggestItem } from '@/types';

// components
import YModal from '@/components/ui/Modal.vue';
import YInput from '@/components/ui/Input.vue';
import YImage from '@/components/ui/Image.vue';
import YTag from '@/components/ui/Tag.vue';
import ThemeLabel from '@/components/ThemeLabel.vue';

// config
import { EMAIL_REG, PASSWORD_REG } from '@/common/reg';

// stores
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

// utils
import { generateAvatar } from '@/utils/generate-avatar';

// common
import { setCustomTheme, getCustomTheme } from '@/common/theme';

const userStore = useUserStore();
const { profile, myUserId } = storeToRefs(userStore);

const message: any = inject('message');
const suggestClick: any = inject('suggestClick');
const changeTheme: any = inject('changeTheme');

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
  userCountdownLeaderBoardInfo: [] as LeaderBoardType[],
  suggestList: [] as SuggestItem[],
  themeList: [] as SuggestItem[]
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
    });
    getSuggestByUserId({ id: String(state.paramsId) }).then((res) => {
      const userSuggestInfo = res.data?.result?.suggest;
      state.suggestList = userSuggestInfo.filter((item: any) => !item.isTheme);
      state.themeList = userSuggestInfo.filter((item: any) => item.isTheme);
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
    <div class="y-user__profile">
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
    </div>
    <div class="y-user__content">
      <div class="y-user__leaderboard">
        <div class="y-user__leaderboard-title">打字记录</div>
        <div
          class="y-user__leaderboard-info"
          v-if="state.userTimeLeaderBoardInfo?.length || state.userCountdownLeaderBoardInfo?.length"
        >
          <div class="y-user__leaderboard-info-item" v-if="state.userTimeLeaderBoardInfo?.length">
            <div class="y-user__leaderboard-info-item-title">限时模式</div>
            <div class="y-user__leaderboard-info-item-list">
              <table class="y-user__leaderboard-info-item-table">
                <thead>
                  <tr>
                    <td>{{ $t('speed') }}</td>
                    <td>{{ $t('accuracy') }}</td>
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
                    <td>{{ $t('speed') }}</td>
                    <td>{{ $t('accuracy') }}</td>
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
        <div v-else class="gray-04">无记录</div>
      </div>
      <div class="y-user__suggest">
        <div class="y-user__suggest-title">
          反馈记录
          <span class="y-user__suggest-action" @click="suggestClick">反馈</span>
        </div>
        <div class="y-user__suggest-content" v-if="state.suggestList?.length">
          <div
            v-for="item in state.suggestList"
            :key="item.id"
            class="y-user__suggest-list-content"
            :class="[item.isTheme ? 'flex-center--y' : '']"
          >
            <YTag v-if="item.canShow" text="已展示"></YTag>
            <YTag v-if="item.accept" text="已采纳"></YTag>
            <YTag v-if="item.done" text="已完成"></YTag>
            {{ item.content }}
          </div>
        </div>
        <div v-else class="gray-04">无记录</div>
      </div>
      <div class="y-user__suggest">
        <div class="y-user__suggest-title">
          定制的主题
          <span class="y-user__suggest-action" @click="changeTheme('custom')">定制</span>
        </div>
        <div class="y-user__suggest-content" v-if="state.themeList?.length">
          <div
            v-for="item in state.themeList"
            :key="item.id"
            class="y-user__suggest-list-content"
            :class="[item.isTheme ? 'flex-center--y' : '']"
          >
            <YTag v-if="item.accept" text="已采纳"></YTag>
            <YTag v-if="item.done" text="已完成"></YTag>
            <YTag :text="`主题色：${getCustomTheme(item.content)?.['THEME_INPUT']}`"></YTag>

            <ThemeLabel
              style="margin-left: 4px"
              :custom-theme-obj="getCustomTheme(item.content)"
            ></ThemeLabel>
            <span
              @click="setCustomTheme(item.content)"
              class="gray-06 y-user__suggest-content-set flex-center--y"
              style="margin-left: 4px; cursor: pointer"
            >
              点击设置该主题
            </span>
          </div>
        </div>
        <div v-else class="gray-04">无记录</div>
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
.y-user.y-main {
  width: 100%;
  margin: 12px 0;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.y-user__profile,
.y-user__leaderboard,
.y-user__suggest {
  padding: 20px 24px;
  background: $layout-background-gray;
  border: 1px solid $border-hairline;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}
.y-user__profile {
  padding: 24px;
  position: sticky;
  top: 24px;
}
.y-user__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.y-user__info {
  display: flex;
  align-items: center;
  min-width: 0;
}
.y-user__image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border: 1px solid $border-hairline;
  border-radius: $radius-lg;
  overflow: hidden;
}
.y-user__name-info {
  margin-left: 16px;
  min-width: 0;
}
.y-user__user-name {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
  word-break: break-all;
}
.y-user__user-email {
  margin-top: 4px;
  color: $gray-06;
  font-size: 13px;
  word-break: break-all;
}
.y-user__user-status {
  font-size: 11px;
  font-weight: 500;
  color: $gray-06;
  border-radius: $radius-full;
  padding: 2px 8px;
  margin-left: 6px;
  border: 1px solid $border-hairline;
  vertical-align: middle;
}

.y-user__setting {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid $border-hairline;
}
.y-user__setting-title,
.y-user__leaderboard-title,
.y-user__suggest-title {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0;
  margin-bottom: 12px;
}
.y-user__setting-title {
  font-size: 13px;
  color: $gray-06;
  margin-bottom: 10px;
}
.y-user__suggest-action {
  font-size: 13px;
  font-weight: 500;
  color: $accent-text;
  margin-left: 8px;
  cursor: pointer;
}
.y-user__suggest-list-content {
  font-size: 14px;
  margin-bottom: 12px;
  color: $gray-06;
  line-height: 1.6;
}
.y-user__setting-set {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}
.y-user__setting-set-item {
  color: $gray-06;
  cursor: pointer;
  transition: color 0.2s $ease-out;
  &:hover {
    color: $accent-text;
  }
}
.y-user-pq__container {
  color: $gray-06;
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
  margin: 16px 0 8px;
  font-size: 13px;
  font-weight: 500;
}
.y-user__leaderboard-info-item-table {
  width: 100%;
  max-width: 100%;
  font-size: 13px;
  border-collapse: collapse;
  border-spacing: 0;
  td {
    padding: 8px;
    white-space: nowrap;
    border-radius: $radius-sm;
  }
  thead td {
    color: $gray-06;
    font-weight: 500;
  }
  tbody {
    position: relative;
    tr:nth-child(2n + 1) {
      background-color: $background-gray;
    }
  }
}
</style>
