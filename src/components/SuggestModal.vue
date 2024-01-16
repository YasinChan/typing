<script lang="ts" setup>
import { computed, reactive, onMounted, inject } from 'vue';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

// components
import YTextarea from '@/components/ui/Textarea.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';
import YTag from '@/components/ui/Tag.vue';
import YLoading from '@/components/ui/Loading.vue';

// stores
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

// apis
import { getSuggest, createSuggest, voteSuggest } from '@/request';

// svg
import IcoUp from '@/assets/svg/up.svg';
import IcoFilter from '@/assets/svg/filter.svg';

const userStore = useUserStore();
const { profile, getProvinceUser } = storeToRefs(userStore);

type SuggestItem = {
  id: string;
  content: string;
  updatedAt: string;
  userName: string;
  userId: string;
  up: number;
  canShow: boolean;
  down: number;
  accept: boolean;
  done: boolean;
};

const message: any = inject('message');
const state = reactive({
  show: false,
  isAnonymity: false,
  suggestList: [] as SuggestItem[],
  currentSort: 'time' as 'time' | 'hot',
  suggestContent: '',
  isLoading: true
});

onMounted(() => {
  getSuggestList();
});

const replyName = computed(() => {
  if (profile.value?.userName) {
    return profile.value.userName;
  } else if (getProvinceUser.value) {
    return getProvinceUser.value;
  }
  return '';
});

async function getSuggestList(sort?: 'time' | 'hot') {
  state.isLoading = true;
  const suggest = await getSuggest({ sort });
  const suggestList: SuggestItem[] = suggest.data?.result?.suggest || [];
  const done = suggestList.filter((item) => item.done);
  const accept = suggestList.filter((item) => !item.done).filter((item) => item.accept);
  const left = suggestList.filter((item) => !item.accept && !item.done);
  state.suggestList = [...done, ...accept, ...left];
  state.isLoading = false;
}

function showSuggest() {
  state.show = true;
}

function filter() {
  if (state.currentSort === 'time') {
    state.currentSort = 'hot';
    getSuggestList('hot');
  } else {
    state.currentSort = 'time';
    getSuggestList('time');
  }
}

async function confirmSuggest() {
  try {
    let params: any = {
      content: state.suggestContent
    };
    if (!state.isAnonymity) {
      if (profile.value?.userName && profile.value?.userId) {
        params = {
          content: state.suggestContent,
          userId: profile.value?.userId,
          userName: profile.value?.userName
        };
      } else if (replyName.value) {
        params = {
          content: state.suggestContent,
          userName: replyName.value
        };
      }
    }
    const res = await createSuggest(params);
    state.suggestContent = '';
    if (res.data?.message) {
      message({ message: res.data?.message });
    } else {
      message({ message: '发布成功' });
    }
  } catch (error: any) {
    const msg = error.response?.data?.message;
    message({ message: msg, type: 'error' });
  }
}

function getVoteInfo(id: string) {
  return localStorage.getItem('typing:vote:' + id);
}
function setVoteInfo(id: string, value: string) {
  // 这里的 value 只能是 '1' '-1' '0'
  if (value === '0') {
    localStorage.removeItem('typing:vote:' + id);
    return;
  }
  localStorage.setItem('typing:vote:' + id, value);
}

function upClick(id: string) {
  // value '3' 表示 up - 1 down 不动
  // value '2' 表示 up + 1 down - 1
  // value '1' 表示 up + 1 down 不动
  // value '-1' 表示 up 不动 down + 1
  // value '-2' 表示 up - 1 down + 1
  // value '-3' 表示 up 不动 down - 1
  const voteInfo = getVoteInfo(id);
  if (voteInfo === '1') {
    voteSuggest({
      id,
      value: '3'
    }).then((res) => {
      message({ message: '取消投票' });
      setVoteInfo(id, '0');
      state.suggestList = state.suggestList.map((item) => {
        if (item.id === id) {
          item.up = item.up - 1;
        }
        return item;
      });
    });
  } else if (voteInfo === '-1') {
    voteSuggest({
      id,
      value: '2'
    }).then((res) => {
      message({ message: '已投票' });
      setVoteInfo(id, '1');
      state.suggestList = state.suggestList.map((item) => {
        if (item.id === id) {
          item.up = item.up + 1;
          item.down = item.down - 1;
        }
        return item;
      });
    });
  } else {
    voteSuggest({
      id,
      value: '1'
    }).then((res) => {
      message({ message: '已投票' });
      setVoteInfo(id, '1');
      state.suggestList = state.suggestList.map((item) => {
        if (item.id === id) {
          item.up = item.up + 1;
        }
        return item;
      });
    });
  }
}
function downClick(id: string) {
  const voteInfo = getVoteInfo(id);
  if (voteInfo === '1') {
    voteSuggest({
      id,
      value: '-2'
    }).then((res) => {
      message({ message: '已投票' });
      setVoteInfo(id, '-1');
      state.suggestList = state.suggestList.map((item) => {
        if (item.id === id) {
          item.up = item.up - 1;
          item.down = item.down + 1;
        }
        return item;
      });
    });
  } else if (voteInfo === '-1') {
    voteSuggest({
      id,
      value: '-3'
    }).then((res) => {
      message({ message: '取消投票' });
      setVoteInfo(id, '0');
      state.suggestList = state.suggestList.map((item) => {
        if (item.id === id) {
          item.down = item.down - 1;
        }
        return item;
      });
    });
  } else {
    voteSuggest({
      id,
      value: '-1'
    }).then((res) => {
      message({ message: '已投票' });
      setVoteInfo(id, '-1');
      state.suggestList = state.suggestList.map((item) => {
        if (item.id === id) {
          item.down = item.down + 1;
        }
        return item;
      });
    });
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
        <span class="y-submit-suggest__filter flex-center--y" v-throttle-click:500="filter"
          ><IcoFilter></IcoFilter>{{ state.currentSort === 'time' ? '最新' : '最热' }}</span
        >
      </div>
      <YLoading class="y-submit-suggest__loading" v-if="state.isLoading"></YLoading>
      <div
        v-else
        class="y-submit-suggest__list gray-08"
        :class="{ 'y-submit-suggest__list-even': index % 2 === 0 }"
        v-for="(item, index) in state.suggestList.filter((suggest) => suggest.canShow)"
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
              v-throttle-click:2000="upClick.bind(null, item.id)"
              class="y-submit-suggest__list-data-up"
              :class="{ 'y-submit-suggest__list-data--active': getVoteInfo(item.id) === '1' }"
            >
              <IcoUp></IcoUp>
              {{ item.up ? item.up : '' }}
            </span>
            <span
              v-throttle-click:2000="downClick.bind(null, item.id)"
              class="y-submit-suggest__list-data-down"
              :class="{ 'y-submit-suggest__list-data--active': getVoteInfo(item.id) === '-1' }"
            >
              <IcoUp></IcoUp>
              {{ item.down ? item.down : '' }}
            </span>
          </div>
          <div>
            <span v-if="item.userName" class="gray-08">{{ item.userName }}</span>
            <span v-if="item.userName"> · </span>
            <span class="gray-06">{{ dayjs(item.updatedAt).format('YY/MM/DD HH:mm') }}</span>
          </div>
        </div>
      </div>
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
        <YTextarea placeholder="请提出你的建议~" v-model="state.suggestContent"></YTextarea>
        <YButton
          :disable="!state.suggestContent"
          style="margin-top: 10px"
          size="small"
          @click="confirmSuggest"
          >确定</YButton
        >
        <span class="y-submit-suggest__reply-tips">
          *为避免展示无意义的内容，各位提出的建议与反馈将会在开发者整理后展示出来~
        </span>
      </div>
    </template>
  </YModal>
</template>
<style lang="scss">
.y-submit-suggest.tooltip {
  position: fixed;
  right: 60px;
  bottom: 20px;
  .y-submit-suggest__svg {
    width: 30px;
    height: 30px;
    fill: $main-color;
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
  }
  .y-modal__footer {
    border-top: 1px solid $gray-02;
    padding-top: 10px;
  }
}
.y-submit-suggest__tips {
  color: $gray-04;
  font-size: 14px;
  margin-bottom: 10px;
}
.y-submit-suggest__filter {
  cursor: pointer;
  svg {
    fill: $gray-06;
    width: 18px;
    height: 18px;
    margin-right: 4px;
  }
}

.y-submit-suggest__loading {
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
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
  color: $main-color;
  svg {
    fill: $main-color;
  }
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
    color: $gray-04;
    &.active {
      color: $main-color;
    }
  }
}
.y-submit-suggest__reply-tips {
  color: $gray-04;
  font-size: 12px;
  margin-left: 10px;
}
</style>
