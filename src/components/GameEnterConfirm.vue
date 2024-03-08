<script setup lang="ts">
import { inject, reactive } from 'vue';
// components
import YInput from '@/components/ui/Input.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';

// composables
import { useUser } from '@/composables/use-user';

// types
import type { WsItem } from '@/types';

const { userName } = useUser();

const triggerShowLogin: any = inject('triggerShowLogin');

const emits = defineEmits(['nickname']);

const state = reactive({
  showSettingGameName: false,
  nickname: '',
  nicknameError: '',
  target: {} as WsItem,
  op: ''
});

function confirmSettingGameName() {}
function login() {
  state.showSettingGameName = false;
  triggerShowLogin();
}
function setShowSettingGameName(target: WsItem) {
  state.target = target;
  state.op = target.op;
  // @ts-ignore
  state.nickname = userName.value;
  state.showSettingGameName = true;
}
function confirm() {
  if (state.target?.player && state.target.player.includes(state.nickname)) {
    state.nicknameError = '昵称已存在';
    return;
  }
  emits('nickname', state.nickname, state.op);
  state.showSettingGameName = false;
}

defineExpose({
  setShowSettingGameName
});
</script>
<template>
  <YModal
    :show="state.showSettingGameName"
    @close="state.showSettingGameName = false"
    @confirm="confirmSettingGameName"
  >
    <template #header>
      <h3>进入前请设置昵称或登录</h3>
    </template>
    <template #body>
      <div class="gray-08">
        你可以直接设置昵称后进入房间或者<span class="main-color cursor-pointer" @click="login"
          >登录</span
        >后进入房间
      </div>
      <div class="y-game__modal-set-nickname">
        <span>设置昵称：</span>
        <YInput
          v-model="state.nickname"
          :error-text="state.nicknameError"
          placeholder="昵称"
        ></YInput>
      </div>
    </template>
    <template #footer>
      <YButton @click="confirm">确定</YButton>
      <YButton @click="login" theme="secondary" style="margin-left: 20px">登录/注册</YButton>
    </template>
  </YModal>
</template>

<style lang="scss">
.y-game__modal-set-nickname {
  color: $gray-08;
  margin-top: 20px;
  span {
    display: block;
    margin-bottom: 10px;
  }
}
</style>
