<script lang="ts" setup>
import { computed, reactive, onMounted, inject, watch } from 'vue';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

// components
import YTextarea from '@/components/ui/Textarea.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';
import YTag from '@/components/ui/Tag.vue';
import YLoading from '@/components/ui/Loading.vue';
import ThemeLabel from '@/components/ThemeLabel.vue';
import Tooltip from '@/components/ui/Tooltip.vue';

// stores
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/store/user';

// apis
import { getSuggest, createSuggest, voteSuggest } from '@/request';

// svg
import IcoUp from '@/assets/svg/up.svg';
import IcoFilter from '@/assets/svg/filter.svg';
import IcoTips from '@/assets/svg/tips.svg';

// types
import type { SuggestItem, COLOR_TYPE } from '@/types';
import { COLOR_ENUM } from '@/types';

// common
import { removeAllCustomCssValue, setCustomCssValue } from '@/common/color';

const userStore = useUserStore();
const { profile, getProvinceUser } = storeToRefs(userStore);

const message: any = inject('message');
const state = reactive({
  show: false,
  isAnonymity: false,
  suggestList: [] as SuggestItem[],
  activeSuggest: {} as SuggestItem,
  customObj: {} as COLOR_TYPE,
  currentSort: 'time' as 'time' | 'hot',
  suggestContent: '',
  isLoading: true
});

onMounted(() => {
  getSuggestList();
});

watch(
  () => state.show,
  (show) => {
    if (!show) {
      // @ts-ignore
      state.activeSuggest = {};
    }
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
  // @ts-ignore
  state.activeSuggest = {};
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

function getThemeName(ct: string) {
  const reg = /%(.*?)%/;
  const is = reg.test(ct);
  if (is) {
    const content = ct.match(reg)?.[1];
    if (!content) return ct;
    const obj = JSON.parse(content);

    state.customObj = obj;
    const themeName = obj['THEME_INPUT'];
    return themeName;
  }
  return ct;
}
function activeSetFirstSuggest(info: SuggestItem) {
  state.activeSuggest = info;
}
function setCustomTheme(info?: string) {
  let customObj;
  if (info) {
    const reg = /%(.*?)%/;
    const is = reg.test(info);
    if (is) {
      const content = info.match(reg)?.[1];
      if (!content) return;
      customObj = JSON.parse(content);
    }
  } else {
    customObj = state.customObj;
  }

  removeAllCustomCssValue();
  setCustomCssValue(COLOR_ENUM['LAYOUT_BACKGROUND_COLOR'], customObj['LAYOUT_BACKGROUND_COLOR']);
  setCustomCssValue(COLOR_ENUM['MAIN_COLOR'], customObj['MAIN_COLOR']);
  setCustomCssValue(COLOR_ENUM['MAIN_RED'], customObj['MAIN_RED']);
  setCustomCssValue(COLOR_ENUM['LABEL_WHITE'], customObj['LABEL_WHITE']);
  setCustomCssValue(COLOR_ENUM['BACKGROUND_COLOR'], customObj['BACKGROUND_COLOR']);
  setCustomCssValue(COLOR_ENUM['LAYOUT_BACKGROUND_COLOR'], customObj['LAYOUT_BACKGROUND_COLOR']);
  setCustomCssValue(COLOR_ENUM['GRAY_08'], customObj['GRAY_08']);
  setCustomCssValue(COLOR_ENUM['GRAY_06'], customObj['GRAY_06']);
  setCustomCssValue(COLOR_ENUM['GRAY_04'], customObj['GRAY_04']);
  setCustomCssValue(COLOR_ENUM['GRAY_02'], customObj['GRAY_02']);
}
defineExpose({
  showSuggest,
  activeSetFirstSuggest
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
      <template v-else>
        <div
          v-if="state.activeSuggest.createdAt"
          class="y-submit-suggest__list y-submit-suggest__list--active gray-08"
        >
          <div class="y-submit-suggest__list-content flex-center--y">
            <YTag v-if="state.activeSuggest.done" text="已完成"></YTag>
            <YTag v-if="state.activeSuggest.accept" text="已采纳"></YTag>
            <YTag
              v-if="state.activeSuggest.isTheme"
              :text="`主题色：${getThemeName(state.activeSuggest.content)}`"
            ></YTag>
            <ThemeLabel
              v-if="state.activeSuggest.isTheme"
              style="margin-left: 4px"
              :label-background-color="state.customObj['LAYOUT_BACKGROUND_COLOR']"
              :background-color="state.customObj['BACKGROUND_COLOR']"
              :red-color="state.customObj['MAIN_RED']"
              :gray-color="state.customObj['GRAY_08']"
              :main-color="state.customObj['MAIN_COLOR']"
            ></ThemeLabel>
            <template v-else>
              {{ state.activeSuggest.content }}
            </template>
            <span
              @click="setCustomTheme(undefined)"
              class="gray-06"
              style="margin-left: 4px; cursor: pointer"
            >
              点击设置该主题
              <Tooltip
                content="在设置中「切换主题」可以自定义主题并生成至此，若支持该主题可以为此投票，投票多的将设置为预设主题。"
              >
                <IcoTips></IcoTips>
              </Tooltip>
            </span>
          </div>
          <div class="y-submit-suggest__list-info">
            <div class="y-submit-suggest__list-data">
              <span class="y-submit-suggest__list-data-up">
                <IcoUp></IcoUp>
              </span>
              <span class="y-submit-suggest__list-data-down">
                <IcoUp></IcoUp>
              </span>
            </div>
            <div>
              <span v-if="state.activeSuggest.userName" class="gray-08">{{
                state.activeSuggest.userName
              }}</span>
              <span v-if="state.activeSuggest.userName"> · </span>
              <span class="gray-06">{{
                dayjs(state.activeSuggest.createdAt).format('YY/MM/DD HH:mm')
              }}</span>
            </div>
          </div>
        </div>
        <div
          class="y-submit-suggest__list gray-08"
          :class="{ 'y-submit-suggest__list-even': index % 2 === 0 }"
          v-for="(item, index) in state.suggestList.filter((suggest) => suggest.canShow)"
          :key="item.id"
        >
          <div
            class="y-submit-suggest__list-content"
            :class="[item.isTheme ? 'flex-center--y' : '']"
          >
            <YTag v-if="item.done" text="已完成"></YTag>
            <YTag v-if="item.accept" text="已采纳"></YTag>
            <YTag v-if="item.isTheme" :text="`主题色：${getThemeName(item.content)}`"></YTag>

            <ThemeLabel
              v-if="item.isTheme"
              style="margin-left: 4px"
              :label-background-color="state.customObj['LAYOUT_BACKGROUND_COLOR']"
              :background-color="state.customObj['BACKGROUND_COLOR']"
              :red-color="state.customObj['MAIN_RED']"
              :gray-color="state.customObj['GRAY_08']"
              :main-color="state.customObj['MAIN_COLOR']"
            ></ThemeLabel>
            <template v-else>
              {{ item.content }}
            </template>
            <span
              v-if="item.isTheme"
              @click="setCustomTheme(item.content)"
              class="gray-06 list-content__set flex-center--y"
              style="margin-left: 4px; cursor: pointer"
            >
              点击设置该主题
              <Tooltip
                content="在设置中「切换主题」可以自定义主题并生成至此，若支持该主题可以为此投票，投票多的将设置为预设主题。"
              >
                <IcoTips></IcoTips>
              </Tooltip>
            </span>
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
        <YTextarea placeholder="提出您的建议或反馈~" v-model="state.suggestContent"></YTextarea>
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
.y-submit-suggest__list--active {
  border: 1px solid $main-color;
  box-shadow: 0 0 3px 0 $main-color;
  animation: glow 0.4s ease-in-out infinite alternate;
  margin: 5px;
}
@keyframes glow {
  from {
    box-shadow: 0 0 3px 0 $main-color;
  }
  to {
    box-shadow: 0 0 3px 2px $main-color;
  }
}
.y-submit-suggest__list-even {
  background: $background-gray;
}
.y-submit-suggest__list-content {
  margin-bottom: 4px;
  line-height: 20px;
}
.list-content__set {
  svg {
    margin-top: 1px;
    margin-left: 4px;
    width: 14px;
    height: 14px;
    fill: $gray-06;
  }
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
