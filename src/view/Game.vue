<script setup lang="ts">
import { reactive, ref, inject, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// api
import { getWs } from '@/request';

// svg
import IcoChange from '@/assets/svg/change.svg';

// components
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import YLoading from '@/components/ui/Loading.vue';
import GameEnterConfirm from '@/components/GameEnterConfirm.vue';

// composable
import { useUser } from '@/composables/use-user';
import IcoFilter from '@/assets/svg/filter.svg';

// common
import { base64ToString, stringToBase64 } from '@/common/string';

// stores
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/store/game';

// types
import type { WsItem } from '@/types';

const { userName, isLogin } = useUser();

const gameStore = useGameStore();
const { setting } = storeToRefs(gameStore);
const confirm: any = inject('confirm');

const router = useRouter();

const triggerShowLogin: any = inject('triggerShowLogin');

const gameEnterConfirmRef = ref();

const state = reactive({
  showSetting: false,
  count: 2,
  lists: [] as WsItem[],
  isLoading: true
});

onMounted(() => {
  gameStore.setIsFromGame(true);
  refreshList();
});

const currentPlayerLen = computed(() => {
  return state.lists.map((item) => item.player).flat().length;
});

function refreshList() {
  state.lists = [];
  state.isLoading = true;
  getWs().then((res) => {
    state.lists = res.data?.result?.ws;
    state.isLoading = false;
  });
}

async function confirmCreate() {
  if (userName.value) {
    const routerPath = stringToBase64(userName.value);

    const isExist = state.lists.some((item) => item.op === routerPath);
    if (isExist) {
      confirm({
        title: '你已经创建房间了哦',
        ok: '去房间！',
        confirmClose: () => {
          return true;
        },
        confirm: () => {
          router.push({
            name: 'GameRoom',
            params: { id: routerPath },
            query: { name: userName.value }
          });
          return true;
        }
      });
      return;
    }
    gameStore.setSetting(userName.value, {
      count: state.count
    });

    await router.push({
      name: 'GameRoom',
      params: { id: routerPath },
      query: { name: userName.value }
    });
  }
  state.showSetting = false;
}

function clickCreate() {
  if (isLogin.value) {
    state.showSetting = true;
  } else {
    triggerShowLogin();
  }
}

function enterRoom(target: WsItem) {
  if (isLogin.value) {
    router.push({
      name: 'GameRoom',
      params: { id: target.op },
      query: { name: userName.value }
    });
  } else {
    gameEnterConfirmRef.value?.setShowSettingGameName(target);
  }
}

function getNickname(val: string, op: string) {
  router.push({
    name: 'GameRoom',
    params: { id: op },
    query: { name: val }
  });
}
</script>

<template>
  <main class="y-game">
    <h1 style="margin-bottom: 20px">
      开发中，敬请期待！页面会随时更新，创建的房间可能随时被删除哦！
    </h1>
    <div class="y-game__rule">
      在这里你可以创建比一比，并邀请好友一起参加。
      <div v-if="!isLogin" class="y-game__rule gray-06">
        不过由于目前服务器资源有限，为限制人数，暂时需要<span
          class="main-color cursor-pointer"
          @click="triggerShowLogin"
          >登录</span
        >后才能创建比一比。
      </div>
    </div>
    <YButton @click="clickCreate">{{ isLogin ? '创建比一比' : '点击登录/注册' }}</YButton>
    <div class="y-game__current flex-center--y">
      <div>
        当前比一比人数：<span class="y-game__current-count">{{ currentPlayerLen }} 人</span>
      </div>
      <IcoChange class="y-game__current-refresh" @click="refreshList"></IcoChange>
    </div>
    <div class="y-game__list">
      <YLoading v-if="state.isLoading"></YLoading>
      <div
        class="y-game__list-item--empty y-game__list-item"
        v-for="item in state.lists"
        :key="item.op"
      >
        <div class="y-game__list-item-title">{{ base64ToString(item.op) }}的房间</div>
        <div class="gray-06">人数限制：{{ item.count }} 人</div>
        <div class="gray-06">
          {{ item.count <= item.player.length ? '人数已满' : `当前 ${item.player.length} 人` }}
          <span
            v-if="item.count > item.player.length"
            class="main-color cursor-pointer"
            @click="enterRoom(item)"
            >进入房间</span
          >
        </div>
      </div>
      <div class="y-game__list-item--empty"></div>
      <div class="y-game__list-item--empty"></div>
      <div class="y-game__list-item--empty"></div>
    </div>
  </main>
  <YModal :show="state.showSetting" @close="state.showSetting = false" @confirm="confirmCreate">
    <template #header>
      <h3>设置</h3>
    </template>
    <template #body>
      <div class="y-game__setting gray-08">
        <div>身份：{{ userName }}</div>
        <div class="flex-center--y">
          <span>选择参赛人数：</span>
          <YDropDown>
            <template #title>
              <div class="y-game__modal-title flex-center--y">
                <IcoFilter></IcoFilter>
                {{ state.count }} 人
              </div>
            </template>
            <template #menu>
              <div class="y-game__modal-content">
                <div
                  class="y-game__modal-content-item"
                  :class="state.count === 2 ? 'y-game__modal-content-item--active' : ''"
                  @click="state.count = 2"
                >
                  2 人
                </div>
                <div
                  class="y-game__modal-content-item"
                  :class="state.count === 3 ? 'y-game__modal-content-item--active' : ''"
                  @click="state.count = 3"
                >
                  3 人
                </div>
                <div
                  class="y-game__modal-content-item"
                  :class="state.count === 4 ? 'y-game__modal-content-item--active' : ''"
                  @click="state.count = 4"
                >
                  4 人
                </div>
              </div>
            </template>
          </YDropDown>
        </div>
      </div>
    </template>
  </YModal>
  <GameEnterConfirm ref="gameEnterConfirmRef" @nickname="getNickname"></GameEnterConfirm>
</template>

<style lang="scss">
.y-game__rule {
  margin-bottom: 20px;
  line-height: 28px;
}
.y-game__modal-title {
  cursor: pointer;
  padding: 2px;
  font-size: 14px;
  border-radius: 2px;
  background: $gray-02;
  transition: all 0.2s;
  color: $gray-06;
  svg {
    transition: all 0.2s;
    fill: $gray-06;
    width: 18px;
    height: 18px;
    margin-right: 4px;
  }
  &:hover {
    background: $main-color;
    color: $label-white;
    svg {
      fill: $label-white;
    }
  }
}
.y-game__modal-content {
  white-space: nowrap;
  font-size: 14px;
  border: 1px solid $gray-02;
  border-radius: 2px;
}
.y-game__modal-content-item {
  cursor: pointer;
  border-radius: 2px;
  padding: 4px 10px;
  display: block;
  transition: all 0.2s;
  color: inherit;
  &:hover {
    background-color: $main-color;
    color: $label-white;
  }
  &.y-game__modal-content-item--active {
    background-color: $main-color;
    color: $label-white;
  }
}
.y-game__current {
  margin-top: 20px;
}
.y-game__current-count {
  display: inline-block;
  position: relative;
  &:after {
    position: absolute;
    content: '';
    width: 6px;
    height: 6px;
    background: $main-color;
    border-radius: 6px;
    right: -12px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.y-game__current-refresh {
  margin-left: 20px;
  cursor: pointer;
  width: 40px;
  height: 20px;
  fill: $gray-08;
}
.y-game__list {
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  justify-content: space-between;
  margin-top: 20px;
  position: relative;
  .y-loading {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
.y-game__list-item--empty {
  width: 30%;
  padding: 10px;
  margin-bottom: 20px;
}
.y-game__list-item {
  border-radius: 2px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}
.y-game__list-item-title {
  margin-bottom: 10px;
}
</style>
