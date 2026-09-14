<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import LeaderBoardItem from '@/components/LeaderBoardItem.vue';
import YLoading from '@/components/ui/Loading.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import type { LeaderBoardMineType, LeaderBoardType } from '@/types';

const props = defineProps<{
  title: string;
  list: LeaderBoardType[];
  page: number;
  pages: number;
  loading: boolean;
  total: number;
  mine: LeaderBoardMineType | null;
  mineFetched: boolean;
  mineResolved: boolean;
  mineOnly: boolean;
  loadError: boolean;
}>();

const emit = defineEmits<{
  loadMore: [];
  toggleMine: [];
}>();

const scroller = ref<HTMLElement | null>(null);
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const hasMore = computed(
  () => !props.mineOnly && props.pages > 0 && props.page < props.pages
);

function rankOf(index: number) {
  // 滚动加载是累加列表，名次直接用当前下标
  return index + 1;
}

function isMe(item: LeaderBoardType) {
  return !!props.mine && item.objectId === props.mine.objectId;
}

function isSentinelVisible() {
  const root = scroller.value;
  const el = sentinel.value;
  if (!root || !el) return false;
  const rootRect = root.getBoundingClientRect();
  const senRect = el.getBoundingClientRect();
  return senRect.top <= rootRect.bottom + 160;
}

function tryLoadMore() {
  // 失败后不要死循环自动重试，交给「点击重试」
  if (props.loading || props.loadError || !hasMore.value || !props.list.length) return;
  emit('loadMore');
}

function setupObserver() {
  observer?.disconnect();
  if (!scroller.value || !sentinel.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        tryLoadMore();
      }
    },
    { root: scroller.value, rootMargin: '160px 0px' }
  );
  observer.observe(sentinel.value);
}

onMounted(() => {
  setupObserver();
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

// 第一页如果撑不满容器，observer 不会再次触发；加载结束后再判断一次
watch(
  () => [props.loading, props.loadError, props.list.length, hasMore.value] as const,
  async ([loading, loadError]) => {
    await nextTick();
    setupObserver();
    if (!loading && !loadError && isSentinelVisible()) {
      tryLoadMore();
    }
  }
);

watch(
  () => props.mineOnly,
  async (only) => {
    await nextTick();
    if (!scroller.value) return;
    if (only) {
      scroller.value.scrollTop = 0;
      return;
    }
    const el = scroller.value.querySelector('.y-leader-board-item--me') as HTMLElement | null;
    el?.scrollIntoView({ block: 'center' });
  }
);
</script>
<template>
  <div class="y-leader-board__item">
    <div class="y-leader-board__title">
      <div class="y-leader-board__title-main flex-center--y">
        <span>{{ title }}</span>
        <Tooltip v-if="mineFetched">
          <template #content>
            <div class="y-leader-board__tip">{{ $t('sentence.leaderboard_rule3') }}</div>
          </template>
          <span class="y-leader-board__count">
            {{ $t('player_count', { n: total }) }}
          </span>
        </Tooltip>
      </div>
      <Tooltip
        v-if="mineFetched && mine"
        class="y-leader-board__mine-tip"
        :content="$t('my_rank')"
      >
        <button
          type="button"
          class="y-leader-board__mine-btn"
          :class="{ 'is-active': mineOnly }"
          @click="emit('toggleMine')"
        >
          {{ $t('my_rank_n', { n: mine.rank }) }}
        </button>
      </Tooltip>
      <span v-else-if="mineFetched && mineResolved" class="y-leader-board__mine-empty">
        {{ $t('not_on_leaderboard') }}
      </span>
      <span v-else-if="mineFetched" class="y-leader-board__mine-empty">
        {{ $t('rank_unavailable') }}
      </span>
    </div>
    <div ref="scroller" class="y-leader-board__scroller">
      <table class="y-leader-board__header">
        <thead>
          <tr>
            <td>{{ $t('ranking') }}</td>
            <td>{{ $t('nickname') }}</td>
            <td>{{ $t('speed') }}</td>
            <td>{{ $t('accuracy') }}</td>
            <td>{{ $t('duration') }}</td>
            <td class="y-leader-board__header-finish-time">{{ $t('completion') }}</td>
          </tr>
        </thead>
        <tbody>
          <template v-if="mineOnly">
            <LeaderBoardItem
              v-if="mine"
              :key="mine.objectId"
              :rank="mine.rank"
              :leader-board-item="mine"
              :is-me="true"
            ></LeaderBoardItem>
            <tr v-else>
              <td colspan="6" class="y-leader-board__status y-leader-board__empty">
                {{ $t('not_on_leaderboard') }}
              </td>
            </tr>
          </template>
          <template v-else-if="list.length">
            <LeaderBoardItem
              v-for="(item, index) in list"
              :key="item.objectId"
              :rank="rankOf(index)"
              :leader-board-item="item"
              :is-me="isMe(item)"
            ></LeaderBoardItem>
          </template>
          <tr v-else-if="loading">
            <td colspan="6" class="y-leader-board__status">
              <YLoading class="y-leader-board__loading"></YLoading>
            </td>
          </tr>
          <tr v-else-if="loadError">
            <td colspan="6" class="y-leader-board__status">
              <button type="button" class="y-leader-board__retry" @click="emit('loadMore')">
                {{ $t('load_more_failed') }}
              </button>
            </td>
          </tr>
          <tr v-else>
            <td colspan="6" class="y-leader-board__status y-leader-board__empty">
              {{ $t('empty_leaderboard') }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!mineOnly && list.length && loading" class="y-leader-board__more">
        <YLoading class="y-leader-board__loading y-leader-board__loading--more"></YLoading>
      </div>
      <div v-else-if="!mineOnly && list.length && loadError" class="y-leader-board__more">
        <button type="button" class="y-leader-board__retry" @click="emit('loadMore')">
          {{ $t('load_more_failed') }}
        </button>
      </div>
      <div ref="sentinel" class="y-leader-board__sentinel" aria-hidden="true"></div>
    </div>
  </div>
</template>
