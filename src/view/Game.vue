<script setup lang="ts">
import { reactive, ref, inject, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

// api
import { getWs } from '@/request';

// svg
import IcoChange from '@/assets/svg/change.svg';

// components
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';
import YInput from '@/components/ui/Input.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import YLoading from '@/components/ui/Loading.vue';
import GameEnterConfirm from '@/components/GameEnterConfirm.vue';

// composable
import { useUser } from '@/composables/use-user';
import IcoFilter from '@/assets/svg/filter.svg';

// common
import { base64ToString, stringToBase64 } from '@/common/string';

// stores
import { useGameStore } from '@/store/game';

// types
import type { WsItem } from '@/types';

// utils
import { userProfileDeferred, configDeferred } from '@/utils/defer';

const { userName, isLogin } = useUser();

const gameStore = useGameStore();
const confirm: any = inject('confirm');

const router = useRouter();

const triggerShowLogin: any = inject('triggerShowLogin');

const gameEnterConfirmRef = ref();

const quoteList = ['《背影》节选', '《我与地坛》节选', '《冰灯》节选'];

const state = reactive({
  showSetting: false,
  count: 2,
  lists: [] as WsItem[],
  isLoading: true,
  quoteIndex: 0 as number,
  setCountDown: 15 as number, // 自定义的倒计时
  errorText: ''
});

onMounted(() => {
  gameStore.setIsFromGame(true);

  Promise.allSettled([configDeferred, userProfileDeferred]).then(async () => {
    // 等这俩都执行完了，不管成功与否都会到这里来。
    await nextTick();
    const op = router.currentRoute.value?.query?.op as string;
    // 这里是判断是否是分享链接的
    if (op) {
      // 这表示是复制过来的
      enterRoom({
        op: op,
        player: [],
        time: 0,
        count: 0
      });
    }
  });
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
            query: { name: userName.value ? encodeURIComponent(userName.value) : userName.value }
          });
          return true;
        }
      });
      return;
    }
    gameStore.setSetting(userName.value, {
      count: state.count,
      index: state.quoteIndex,
      countDown: state.setCountDown
    });

    await router.push({
      name: 'GameRoom',
      params: { id: routerPath },
      query: { name: encodeURIComponent(userName.value) }
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
      query: { name: userName.value ? encodeURIComponent(userName.value) : userName.value }
    });
  } else {
    gameEnterConfirmRef.value?.setShowSettingGameName(target);
  }
}

function getNickname(val: string, op: string) {
  router.push({
    name: 'GameRoom',
    params: { id: op },
    query: { name: encodeURIComponent(val) }
  });
}

watch(
  () => state.setCountDown,
  () => {
    // @ts-ignore
    if (!/\d+/.test(Number(state.setCountDown))) {
      state.errorText = '请输入数字';
    } else {
      state.errorText = '';
    }
  }
);
</script>

<template>
  <main class="y-game">
    <div class="y-page-head">
      <div>
        <h1 class="y-page-title">{{ $t('game_mode') }}</h1>
        <p class="y-page-desc">{{ $t('sentence.game_rule1') }}</p>
      </div>
    </div>
    <div class="y-game__create">
      <div class="y-game__create-copy">
        <div class="y-game__create-title">{{ $t('create_room_title') }}</div>
        <p class="y-game__create-desc">
          {{ isLogin ? $t('create_game_desc') : $t('join_game_hint') }}
        </p>
      </div>
      <YButton @click="clickCreate">{{ isLogin ? $t('create_game') : '登录后创建' }}</YButton>
    </div>
    <div class="y-game__list-head">
      <div class="y-game__list-title">{{ $t('rooms_available') }}</div>
      <div class="y-game__current flex-center--y">
        <span class="y-game__current-count">{{ currentPlayerLen }} 人在线</span>
        <button type="button" class="y-game__refresh" @click="refreshList">
          <IcoChange></IcoChange>
          刷新
        </button>
      </div>
    </div>
    <div class="y-game__list">
      <YLoading v-if="state.isLoading"></YLoading>
      <div class="y-game__list-item" v-for="item in state.lists" :key="item.op">
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
      <div v-if="!state.isLoading && !state.lists.length" class="y-game__empty">
        {{ $t('rooms_empty') }}
      </div>
    </div>
    <section class="y-game__rules">
      <h3 class="y-game__rules-title">{{ $t('game_rules_title') }}</h3>
      <ul class="y-game__rule">
        <li>{{ $t('sentence.game_rule1') }}</li>
        <li v-if="!isLogin">
          由于目前服务器资源有限，为限制人数，暂时需要<span
            class="main-color cursor-pointer"
            @click="triggerShowLogin"
            >登录</span
          >后才能创建比一比。不过加入已创建的房间则<strong>不需要登录</strong>，设置一个昵称就可以了哦。
        </li>
        <li>
          创建的房间如果<strong>五分钟</strong>内没有任何操作，则会自动关闭。不过当还剩五秒会关闭时，会有弹框提示，任何操作都可以避免关闭。
        </li>
        <li>{{ $t('sentence.game_rule2') }}</li>
      </ul>
    </section>
  </main>
  <YModal :show="state.showSetting" @close="state.showSetting = false" @confirm="confirmCreate">
    <template #header>
      <h3>设置</h3>
    </template>
    <template #body>
      <div class="y-game__setting gray-08">
        <div class="y-game__setting-item">身份：{{ userName }}</div>
        <div class="y-game__setting-item flex-center--y">
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
        <div class="y-game__setting-item flex-center--y">
          <span>选择文案：</span>
          <YDropDown>
            <template #title>
              <div class="y-game__modal-title flex-center--y">
                <IcoFilter></IcoFilter>
                {{ quoteList[state.quoteIndex] }}
              </div>
            </template>
            <template #menu>
              <div class="y-game__modal-content">
                <div
                  class="y-game__modal-content-item"
                  :class="state.quoteIndex === index ? 'y-game__modal-content-item--active' : ''"
                  @click="state.quoteIndex = index"
                  v-for="(item, index) in quoteList"
                  :key="item"
                >
                  {{ item }}
                </div>
              </div>
            </template>
          </YDropDown>
        </div>
        <div class="y-game__setting-item flex-center--y" style="white-space: nowrap">
          <span>{{ $t('custom_countdown') }}：</span>
          <YInput
            :error-text="state.errorText"
            v-model="state.setCountDown"
            placeholder="单位：秒"
          ></YInput>
        </div>
      </div>
    </template>
  </YModal>
  <GameEnterConfirm ref="gameEnterConfirmRef" @nickname="getNickname"></GameEnterConfirm>
</template>

<style lang="scss">
.y-game__setting {
  .y-drop-down__menu {
    left: 0;
    right: auto;
  }
}
.y-game__setting-item {
  margin-bottom: 10px;
}
.y-game__create {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  margin-bottom: 24px;
  background: $layout-background-gray;
  border: 1px solid $border-hairline;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}
.y-game__create-title {
  font-size: 16px;
  font-weight: 500;
}
.y-game__create-desc {
  margin-top: 4px;
  color: $gray-06;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0;
}
.y-game__list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.y-game__list-title {
  font-size: 16px;
  font-weight: 500;
}
.y-game__refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border: 0;
  border-radius: $radius-sm;
  background: transparent;
  color: $gray-06;
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.2s $ease-out, background-color 0.2s $ease-out;
  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
  &:hover {
    color: $accent-text;
    background: $accent-soft;
  }
}
.y-game__rules {
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid $border-hairline;
  color: $gray-06;
  font-size: 14px;
  .y-game__rules-title {
    margin: 0;
    color: $gray-06;
    font-size: 14px;
    font-weight: 500;
  }
  .y-game__rule {
    margin: 12px 0 0;
  }
}
.y-game__empty {
  grid-column: 1 / -1;
  padding: 32px 16px;
  border: 1px dashed $border-hairline;
  border-radius: $radius-md;
  color: $gray-06;
  font-size: 14px;
  text-align: center;
}
.y-game__rule {
  margin-bottom: 20px;
  line-height: 28px;
  font-size: 14px;
  font-weight: 400;
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
    background: $accent-soft;
    color: $accent-text;
    svg {
      fill: $accent-text;
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
    background-color: $accent-soft;
    color: $accent-text;
  }
  &.y-game__modal-content-item--active {
    background-color: $accent-soft;
    color: $accent-text;
  }
}
.y-game__current {
  gap: 12px;
  color: $gray-06;
  font-size: 13px;
  font-weight: 400;
}
.y-game__current-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $main-color;
  }
}
.y-game__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  font-size: 14px;
  margin-top: 0;
  position: relative;
  font-weight: 400;
  .y-loading {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
.y-game__list-item {
  display: block;
  padding: 16px;
  border-radius: $radius-md;
  background: $layout-background-gray;
  box-shadow: $shadow-sm;
  transition: transform 0.2s $ease-out, box-shadow 0.2s $ease-out;
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}
.y-game__list-item-title {
  margin-bottom: 10px;
  font-weight: 700;
}
</style>
