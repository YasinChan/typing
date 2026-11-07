<script lang="ts" setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

// components
import YTextarea from '@/components/ui/Textarea.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';
import YTag from '@/components/ui/Tag.vue';
import YLoading from '@/components/ui/Loading.vue';
import YDropDown from '@/components/ui/DropDown.vue';

// stores
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

// apis
import { createSuggest, getSuggest, voteSuggest } from '@/request';

// svg
import IcoUp from '@/assets/svg/up.svg';
import IcoFilter from '@/assets/svg/filter.svg';
import IcoStar from '@/assets/svg/star.svg';

// types
import type { SuggestItem } from '@/types';

const userStore = useUserStore();
const { profile, getProvinceUser } = storeToRefs(userStore);

const message: any = inject('message');

const suggestFilterRef = ref();
const votingIds = ref<string[]>([]);

const state = reactive({
  show: false,
  isAnonymity: false,
  suggestList: [] as SuggestItem[],
  currentSort: 'time' as 'time' | 'hot',
  suggestContent: '',
  isLoading: true,
  loadError: false,
  isSubmitting: false
});

watch(
  () => state.show,
  (show) => {
    if (!show) {
      state.loadError = false;
      return;
    }
    state.currentSort = 'time';
    getSuggestList('time', true);
  }
);

const replyName = computed(() => {
  if (profile.value?.userName) {
    return profile.value.userName;
  } else if (getProvinceUser.value) {
    return getProvinceUser.value;
  }
  return '';
});

async function getSuggestList(sort?: 'time' | 'hot', force = false) {
  if (!force && state.currentSort === sort) {
    return;
  }
  suggestFilterRef.value?.closeMenu();
  state.isLoading = true;
  state.loadError = false;
  try {
    const suggest = await getSuggest({ sort });
    state.currentSort = sort || 'time';
    const suggestList: SuggestItem[] = suggest.data?.result?.suggest || [];
    // 主题有独立入口，反馈列表只展示建议和 BUG。
    const visible = suggestList.filter((item) => item.canShow && !item.isTheme);
    const pending = visible.filter((item) => !item.accept && !item.done);
    const accept = visible.filter((item) => item.accept && !item.done);
    const done = visible.filter((item) => item.done);
    state.suggestList = [...pending, ...accept, ...done];
  } catch (error) {
    console.error('get suggest failed', error);
    state.suggestList = [];
    state.loadError = true;
  } finally {
    state.isLoading = false;
  }
}

function showSuggest() {
  state.show = true;
}

async function confirmSuggest() {
  const content = state.suggestContent.trim();
  if (!content || state.isSubmitting) return;

  let params: any = { content };
  if (!state.isAnonymity) {
    if (profile.value?.userName && profile.value?.userId) {
      params = {
        content,
        userId: profile.value?.userId,
        userName: profile.value?.userName
      };
    } else if (replyName.value) {
      params = {
        content,
        userName: replyName.value
      };
    }
  }

  state.isSubmitting = true;
  try {
    const res = await createSuggest(params);
    state.suggestContent = '';
    message({ message: res.data?.message || '发布成功' });
    await getSuggestList(state.currentSort, true);
  } catch (error: any) {
    const msg = error.response?.data?.message || '发布失败，请稍后重试';
    message({ message: msg, type: 'error' });
  } finally {
    state.isSubmitting = false;
  }
}

function getVoteInfo(id: string) {
  return localStorage.getItem('typing:vote:' + id);
}

function setVoteInfo(id: string, value: string) {
  if (value === '0') {
    localStorage.removeItem('typing:vote:' + id);
    return;
  }
  localStorage.setItem('typing:vote:' + id, value);
}

function isVoting(id: string) {
  return votingIds.value.includes(id);
}

async function castVote(item: SuggestItem, direction: 'up' | 'down') {
  if (isVoting(item.id)) return;
  const current = getVoteInfo(item.id);
  let value = '';
  let next = '';
  let upDelta = 0;
  let downDelta = 0;

  if (direction === 'up') {
    if (current === '1') {
      value = '3';
      next = '0';
      upDelta = -1;
    } else if (current === '-1') {
      value = '2';
      next = '1';
      upDelta = 1;
      downDelta = -1;
    } else {
      value = '1';
      next = '1';
      upDelta = 1;
    }
  } else if (current === '1') {
    value = '-2';
    next = '-1';
    upDelta = -1;
    downDelta = 1;
  } else if (current === '-1') {
    value = '-3';
    next = '0';
    downDelta = -1;
  } else {
    value = '-1';
    next = '-1';
    downDelta = 1;
  }

  votingIds.value = [...votingIds.value, item.id];
  try {
    await voteSuggest({ id: item.id, value });
    setVoteInfo(item.id, next);
    item.up = Math.max(0, (item.up || 0) + upDelta);
    item.down = Math.max(0, (item.down || 0) + downDelta);
    message({ message: next === '0' ? '取消投票' : '已投票' });
  } catch (error) {
    console.error('vote suggest failed', error);
    message({ message: '投票失败，请稍后重试', type: 'error' });
  } finally {
    votingIds.value = votingIds.value.filter((id) => id !== item.id);
  }
}

defineExpose({
  showSuggest
});
</script>
<template>
  <YModal
    class-name="y-submit-suggest__modal"
    :show="state.show"
    @close="state.show = false"
    @confirm="state.show = false"
  >
    <template #header>
      <h3>建议与反馈</h3>
    </template>
    <template #body>
      <div class="y-submit-suggest__tips flex-center--y-between">
        <span>
          欢迎各位在此提出建议或反馈 BUG。如果你也是开发者，欢迎在
          <a href="https://github.com/YasinChan/typing/issues" target="_blank">Github</a>
          中反馈或者共创。
        </span>
        <YDropDown ref="suggestFilterRef">
          <template #title>
            <div class="y-submit-suggest__filter flex-center--y">
              <IcoFilter></IcoFilter>
              {{ state.currentSort === 'time' ? '最新' : '最热' }}
            </div>
          </template>
          <template #menu>
            <div class="y-submit-suggest__filter-menu">
              <div
                class="y-menu__change"
                :class="[state.currentSort === 'time' ? 'y-menu__change--active' : '']"
                @click="getSuggestList('time')"
              >
                最新
              </div>
              <div
                class="y-menu__change"
                :class="[state.currentSort === 'hot' ? 'y-menu__change--active' : '']"
                @click="getSuggestList('hot')"
              >
                最热
              </div>
            </div>
          </template>
        </YDropDown>
      </div>

      <YLoading class="y-submit-suggest__loading" v-if="state.isLoading"></YLoading>
      <div v-else-if="state.loadError" class="y-submit-suggest__status">
        反馈加载失败
        <button type="button" @click="getSuggestList(state.currentSort, true)">重试</button>
      </div>
      <div v-else-if="!state.suggestList.length" class="y-submit-suggest__status">
        还没有反馈，欢迎提出第一条建议。
      </div>
      <template v-else>
        <div
          class="y-submit-suggest__list gray-08"
          :class="{ 'y-submit-suggest__list-even': index % 2 === 0 }"
          v-for="(item, index) in state.suggestList"
          :key="item.id"
        >
          <div class="y-submit-suggest__list-content">
            <YTag v-if="item.done" text="已完成"></YTag>
            <YTag v-if="item.accept" text="已采纳"></YTag>
            {{ item.content }}
          </div>
          <div class="y-submit-suggest__list-info">
            <div class="y-submit-suggest__list-data">
              <span
                class="y-submit-suggest__list-data-up"
                :class="{
                  'y-submit-suggest__list-data--active': getVoteInfo(item.id) === '1',
                  'is-voting': isVoting(item.id)
                }"
                @click="castVote(item, 'up')"
              >
                <IcoStar></IcoStar>
                {{ item.up || '' }}
              </span>
              <span
                class="y-submit-suggest__list-data-down"
                :class="{
                  'y-submit-suggest__list-data--active': getVoteInfo(item.id) === '-1',
                  'is-voting': isVoting(item.id)
                }"
                @click="castVote(item, 'down')"
              >
                <IcoUp></IcoUp>
                {{ item.down || '' }}
              </span>
            </div>
            <div>
              <router-link
                :to="{ name: 'User', params: { id: item.userId } }"
                v-if="item.userName && item.userId"
                target="_blank"
                class="gray-08"
                >{{ item.userName }}</router-link
              >
              <span v-else-if="item.userName" class="gray-08">{{ item.userName }}</span>
              <span v-if="item.userName"> · </span>
              <span class="gray-06">{{ dayjs(item.createdAt).format('YY/MM/DD HH:mm') }}</span>
            </div>
          </div>
        </div>
      </template>
    </template>

    <template #footer>
      <div class="y-submit-suggest__reply gray-08">
        <p class="y-submit-suggest__reply-title">回复</p>
        <div class="y-submit-suggest__reply-name" v-if="replyName">
          发布者：
          <span @click="state.isAnonymity = false" :class="{ active: !state.isAnonymity }">{{
            replyName
          }}</span>
          <span>/</span>
          <span @click="state.isAnonymity = true" :class="{ active: state.isAnonymity }"
            >匿名发布</span
          >
        </div>
        <YTextarea
          placeholder="提出您的建议或反馈~"
          v-model="state.suggestContent"
          :max-length="300"
        ></YTextarea>
        <YButton
          :disable="!state.suggestContent.trim() || state.isSubmitting"
          style="margin-top: 10px"
          size="small"
          @click="confirmSuggest"
          >{{ state.isSubmitting ? '发布中…' : $t('confirm') }}</YButton
        >
        <span class="y-submit-suggest__reply-tips">
          *为避免展示无意义的内容，各位提出的建议与反馈将会在开发者整理后展示出来~ 也可以加入QQ群
          <b>1028763853</b> 反馈～
        </span>
      </div>
    </template>
  </YModal>
</template>
<style lang="scss">
.y-submit-suggest.tooltip {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: $layout-background-gray;
  box-shadow: $shadow-md;
  justify-content: center;
  transition: transform 0.2s $ease-out, box-shadow 0.2s $ease-out;
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
  .y-submit-suggest__svg {
    width: 22px;
    height: 22px;
    fill: $accent-text;
    cursor: pointer;
    z-index: 999;
  }
}
.y-submit-suggest__modal {
  width: 800px;
  height: 80vh;
  .y-modal__body {
    max-height: calc(80vh - 256px);
    overflow: auto;
    padding-bottom: 20px;
    padding-right: 20px;
  }
  .y-modal__footer {
    border-top: 1px solid $gray-02;
    padding-top: 10px;
  }
}
.y-submit-suggest__tips {
  color: $gray-06;
  font-size: 14px;
  padding-bottom: 10px;
  position: sticky;
  top: 0;
  background: $layout-background-gray;
  z-index: 1;
}
.y-submit-suggest__filter {
  cursor: pointer;
  padding: 5px;
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
.y-submit-suggest__filter-menu {
  white-space: nowrap;
  font-size: 14px;
  border: 1px solid $gray-02;
  border-radius: 2px;
}

.y-submit-suggest__loading {
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
}
.y-submit-suggest__status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 180px;
  color: $gray-06;
  font-size: 14px;
  button {
    border: 0;
    background: transparent;
    color: $accent-text;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
.y-submit-suggest__list {
  padding: 16px 8px;
  font-size: 14px;
}
.y-submit-suggest__list-even {
  background: $background-gray;
}
.y-submit-suggest__list-content {
  margin-bottom: 4px;
  line-height: 20px;
}
.y-submit-suggest__list-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.y-submit-suggest__list-data {
  display: flex;
  align-items: center;
  height: 18px;
}
.y-submit-suggest__list-data-up,
.y-submit-suggest__list-data-down {
  margin-right: 20px;
  display: flex;
  align-items: center;
  width: 40px;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    fill: $gray-06;
  }
}
.y-submit-suggest__list-data-down {
  svg {
    transform: rotate(180deg);
  }
}
.y-submit-suggest__list-data--active {
  color: $accent-text;
  svg {
    fill: $accent-text;
  }
}
.y-submit-suggest__list-data.is-voting {
  opacity: 0.5;
  pointer-events: none;
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
    color: $gray-06;
    &.active {
      color: $accent-text;
    }
  }
}
.y-submit-suggest__reply-tips {
  color: $gray-06;
  font-size: 12px;
  margin-left: 10px;
}
</style>
