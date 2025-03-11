<script lang="ts" setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

// components
import YTextarea from '@/components/ui/Textarea.vue';
import YModal from '@/components/ui/Modal.vue';
import YButton from '@/components/ui/Button.vue';
import YTag from '@/components/ui/Tag.vue';
import YLoading from '@/components/ui/Loading.vue';
import ThemeLabel from '@/components/ThemeLabel.vue';
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
import type { COLOR_TYPE, SuggestItem } from '@/types';

// common
import { setCustomTheme, getCustomTheme } from '@/common/theme';

const userStore = useUserStore();
const { profile, getProvinceUser } = storeToRefs(userStore);

const message: any = inject('message');

const suggestFilterRef = ref();
const router = useRouter();

const state = reactive({
  show: false,
  isAnonymity: false,
  suggestList: [] as SuggestItem[],
  activeSuggest: {} as SuggestItem,
  customObj: {} as COLOR_TYPE,
  currentSort: 'time' as 'time' | 'hot' | 'theme',
  suggestContent: '',
  isLoading: true
});

const emit = defineEmits(['openThemeModal']);

// onMounted(() => {
//   getSuggestList();
// });

watch(
  () => state.show,
  (show) => {
    if (!show) {
      // @ts-ignore
      state.activeSuggest = {};
      router.replace({ query: { suggest_filter: undefined } });
    } else {
      const query = router.currentRoute.value?.query;
      if (query.suggest_filter === 'theme') {
        getSuggestList('theme');
        return;
      }
      getSuggestList();
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

async function getSuggestList(sort?: 'time' | 'hot' | 'theme') {
  if (state.currentSort === sort) {
    return;
  }
  suggestFilterRef.value?.closeMenu();
  state.isLoading = true;
  const suggest = await getSuggest({ sort });
  state.currentSort = sort || 'time';
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

function setTheme() {
  state.show = false;
  emit('openThemeModal');
}

function getCustomThemeFunc(ct: string) {
  if (!ct) return '';
  state.customObj = getCustomTheme(ct);
  if (state.customObj) {
    return state.customObj?.['THEME_INPUT'];
  }
  return ct;
}
function activeSetFirstSuggest(info: SuggestItem) {
  state.activeSuggest = info;
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
        <YDropDown ref="suggestFilterRef">
          <template #title>
            <div class="y-submit-suggest__filter flex-center--y">
              <IcoFilter></IcoFilter>
              {{
                state.currentSort === 'time'
                  ? '最新'
                  : state.currentSort === 'hot'
                  ? '最热'
                  : '主题'
              }}
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
              <div
                class="y-menu__change"
                :class="[state.currentSort === 'theme' ? 'y-menu__change--active' : '']"
                @click="getSuggestList('theme')"
              >
                主题
              </div>
            </div>
          </template>
        </YDropDown>
      </div>
      <YLoading class="y-submit-suggest__loading" v-if="state.isLoading"></YLoading>
      <template v-else>
        <div v-if="state.currentSort === 'theme'" class="y-submit-suggest__custom gray-06">
          以下为用户自定义设置生成的主题，若支持该主题可以点击对应主题下方的「<IcoStar
          ></IcoStar>」为其投票，投票多的将设置为预设主题。如果你也想设置独特的主题，欢迎<span
            class="main-color"
            @click="setTheme"
            >点击此处设置或自定义主题</span
          >，然后你做的主题也可以生成至此展示使用。
        </div>
        <div
          v-if="state.activeSuggest.createdAt"
          class="y-submit-suggest__list y-submit-suggest__list--active gray-08"
        >
          <div class="y-submit-suggest__list-content flex-center--y">
            <YTag v-if="state.activeSuggest.done" text="已完成"></YTag>
            <YTag v-if="state.activeSuggest.accept" text="已采纳"></YTag>
            <YTag
              v-if="state.activeSuggest.isTheme"
              :text="`主题色：${getCustomThemeFunc(state.activeSuggest.content)}`"
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
              @click="setCustomTheme(undefined, state.customObj)"
              class="gray-06 list-content__set flex-center--y"
              style="margin-left: 4px; cursor: pointer"
            >
              点击设置该主题
            </span>
          </div>
          <div class="y-submit-suggest__list-info">
            <div class="y-submit-suggest__list-data">
              <span class="y-submit-suggest__list-data-up">
                <IcoStar></IcoStar>
              </span>
              <span class="y-submit-suggest__list-data-down">
                <IcoUp></IcoUp>
              </span>
            </div>
            <div>
              <span class="main-color cursor-pointer" @click="setTheme">点击定制你的主题</span>
              <span> · </span>
              <router-link
                :to="{ name: 'User', params: { id: state.activeSuggest.userId } }"
                v-if="state.activeSuggest.userName && state.activeSuggest.userId"
                target="_blank"
                class="gray-08"
                >{{ state.activeSuggest.userName }}</router-link
              >
              <span v-else-if="state.activeSuggest.userName" class="gray-08">{{
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
            <YTag
              v-if="item.isTheme"
              :text="`主题色：${getCustomTheme(item.content)?.['THEME_INPUT']}`"
            ></YTag>

            <ThemeLabel
              v-if="item.isTheme"
              style="margin-left: 4px"
              :custom-theme-obj="getCustomTheme(item.content)"
            ></ThemeLabel>
            <template v-else>
              {{ item.content }}
            </template>
            <span
              v-if="item.isTheme"
              @click="setCustomTheme(item.content, state.customObj)"
              class="gray-06 list-content__set flex-center--y"
              style="margin-left: 4px; cursor: pointer"
            >
              点击设置该主题
            </span>
          </div>
          <div class="y-submit-suggest__list-info">
            <div class="y-submit-suggest__list-data">
              <span
                v-throttle-click:2000="upClick.bind(null, item.id)"
                class="y-submit-suggest__list-data-up"
                :class="{ 'y-submit-suggest__list-data--active': getVoteInfo(item.id) === '1' }"
              >
                <IcoStar></IcoStar>
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
              <span v-if="item.isTheme" class="main-color cursor-pointer" @click="setTheme"
                >点击定制你的主题</span
              >
              <span v-if="item.isTheme"> · </span>
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
        <YTextarea placeholder="提出您的建议或反馈~" v-model="state.suggestContent"></YTextarea>
        <YButton
          :disable="!state.suggestContent"
          style="margin-top: 10px"
          size="small"
          @click="confirmSuggest"
          >{{ $t('confirm') }}</YButton
        >
        <span class="y-submit-suggest__reply-tips">
          *为避免展示无意义的内容，各位提出的建议与反馈将会在开发者整理后展示出来~ 也可以加入QQ群 <b>1028763853</b> 反馈～
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
    padding-right: 20px;
  }
  .y-modal__footer {
    border-top: 1px solid $gray-02;
    padding-top: 10px;
  }
}
.y-submit-suggest__tips {
  color: $gray-04;
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
    background: $main-color;
    color: $label-white;
    svg {
      fill: $label-white;
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
.y-submit-suggest__custom {
  font-size: 14px;
  margin-bottom: 16px;
  font-weight: bold;
  span {
    cursor: pointer;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
  svg {
    width: 14px;
    height: 14px;
    fill: $main-color;
  }
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
  transition: color 0.2s;
  &:hover {
    color: $main-color;
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
