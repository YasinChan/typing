<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import dayjs from 'dayjs';

// components
import YButton from '@/components/ui/Button.vue';
import YLoading from '@/components/ui/Loading.vue';
import ThemeLabel from '@/components/ThemeLabel.vue';

// apis
import { getSuggest, voteSuggest } from '@/request';

// common
import { getCustomTheme, setCustomTheme } from '@/common/theme';

// svg
import IcoStar from '@/assets/svg/star.svg';
import IcoUp from '@/assets/svg/up.svg';

// types
import type { SuggestItem } from '@/types';

const emit = defineEmits<{
  customize: [];
  applied: [];
}>();

const message: any = inject('message');
const themes = ref<SuggestItem[]>([]);
const loading = ref(true);
const loadError = ref(false);
const votingIds = ref<string[]>([]);
const sortMode = ref<'latest' | 'hot'>('latest');

const sortedThemes = computed(() =>
  [...themes.value].sort((a, b) => {
    if (sortMode.value === 'hot') {
      const voteDiff = (b.up || 0) - (b.down || 0) - ((a.up || 0) - (a.down || 0));
      if (voteDiff !== 0) return voteDiff;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })
);

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

async function loadThemes() {
  loading.value = true;
  loadError.value = false;
  try {
    const res = await getSuggest({ sort: 'theme' });
    const list: SuggestItem[] = res.data?.result?.suggest || [];
    themes.value = list.filter((item) => item.isTheme && item.canShow);
  } catch (error) {
    console.error('get theme gallery failed', error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function themeObject(item: SuggestItem) {
  const obj = getCustomTheme(item.content);
  return obj && typeof obj === 'object' ? obj : null;
}

function themeName(item: SuggestItem) {
  return themeObject(item)?.['THEME_INPUT'] || '未命名主题';
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
    console.error('vote theme failed', error);
    message({ message: '投票失败，请稍后重试', type: 'error' });
  } finally {
    votingIds.value = votingIds.value.filter((id) => id !== item.id);
  }
}

function applyTheme(item: SuggestItem) {
  if (!themeObject(item)) {
    message({ message: '主题数据异常，暂时无法使用', type: 'error' });
    return;
  }
  setCustomTheme(item.content);
  message({ message: '已应用该主题' });
  emit('applied');
}

onMounted(loadThemes);
</script>

<template>
  <div class="y-theme-gallery">
    <div class="y-theme-gallery__top">
      <p>以下为用户自定义主题，投票高的主题会进入预设主题。喜欢的话可以直接应用。</p>
      <div class="y-theme-gallery__tools">
        <div class="y-theme-gallery__sort">
          <button
            type="button"
            :class="{ 'is-active': sortMode === 'latest' }"
            @click="sortMode = 'latest'"
          >
            最新
          </button>
          <button
            type="button"
            :class="{ 'is-active': sortMode === 'hot' }"
            @click="sortMode = 'hot'"
          >
            最热
          </button>
        </div>
        <YButton size="small" theme="secondary" @click="emit('customize')"> 定制我的主题 </YButton>
      </div>
    </div>

    <YLoading v-if="loading" class="y-theme-gallery__loading"></YLoading>
    <div v-else-if="loadError" class="y-theme-gallery__status">
      <span>主题加载失败</span>
      <button type="button" @click="loadThemes">重试</button>
    </div>
    <div v-else-if="!themes.length" class="y-theme-gallery__status">还没有社区主题</div>
    <div v-else class="y-theme-gallery__list">
      <div v-for="item in sortedThemes" :key="item.id" class="y-theme-gallery__item">
        <ThemeLabel :custom-theme-obj="themeObject(item) || undefined"></ThemeLabel>
        <div class="y-theme-gallery__main">
          <div class="y-theme-gallery__title">{{ themeName(item) }}</div>
          <div class="y-theme-gallery__meta">
            <span v-if="item.userName">{{ item.userName }} · </span>
            <span>{{ dayjs(item.createdAt).format('YY/MM/DD HH:mm') }}</span>
          </div>
        </div>
        <div class="y-theme-gallery__votes">
          <button
            type="button"
            :class="{ 'is-active': getVoteInfo(item.id) === '1' }"
            :disabled="isVoting(item.id)"
            @click="castVote(item, 'up')"
          >
            <IcoStar></IcoStar>
            {{ item.up || 0 }}
          </button>
          <button
            type="button"
            :class="{ 'is-active': getVoteInfo(item.id) === '-1' }"
            :disabled="isVoting(item.id)"
            @click="castVote(item, 'down')"
          >
            <IcoUp></IcoUp>
            {{ item.down || 0 }}
          </button>
        </div>
        <YButton size="small" @click="applyTheme(item)">使用</YButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.y-theme-gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 240px;
}
.y-theme-gallery__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: $gray-06;
  font-size: 13px;
  line-height: 1.7;
  p {
    max-width: 430px;
  }
}
.y-theme-gallery__tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.y-theme-gallery__sort {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: $radius-full;
  background: $background-gray;
  button {
    height: 26px;
    padding: 0 10px;
    border: 0;
    border-radius: $radius-full;
    background: transparent;
    color: $gray-06;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    &:hover {
      color: $gray-08;
    }
    &.is-active {
      background: $layout-background-gray;
      color: $accent-text;
      box-shadow: $shadow-sm;
    }
  }
}
.y-theme-gallery__loading {
  margin: 60px auto;
}
.y-theme-gallery__status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 180px;
  color: $gray-06;
  font-size: 13px;
  button {
    border: 0;
    background: transparent;
    color: $accent-text;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
.y-theme-gallery__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: min(56vh, 480px);
  overflow: auto;
  padding-right: 4px;
}
.y-theme-gallery__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid $border-hairline;
  border-radius: $radius-md;
  background: $background-gray;
}
.y-theme-gallery__main {
  min-width: 0;
  flex: 1;
}
.y-theme-gallery__title {
  color: $gray-08;
  font-size: 14px;
  font-weight: 500;
}
.y-theme-gallery__meta {
  margin-top: 2px;
  color: $gray-06;
  font-size: 12px;
}
.y-theme-gallery__votes {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  button {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 4px 6px;
    border: 0;
    border-radius: $radius-sm;
    background: transparent;
    color: $gray-06;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    &:hover:not(:disabled) {
      color: $accent-text;
      background: $accent-soft;
    }
    &.is-active {
      color: $accent-text;
    }
    &:nth-child(2) svg {
      transform: rotate(180deg);
    }
    &:disabled {
      cursor: wait;
      opacity: 0.6;
    }
    svg {
      width: 12px;
      height: 12px;
      fill: currentColor;
    }
  }
}
</style>
