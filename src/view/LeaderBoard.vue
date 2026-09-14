<script setup lang="ts">
import { onMounted, reactive } from 'vue';

// components
import Tooltip from '@/components/ui/Tooltip.vue';
import LeaderBoardPanel from '@/components/LeaderBoardPanel.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// svg
import IcoTips from '@/assets/svg/tips.svg';

// apis
import { getLeaderBoard } from '@/request';

// type
import type { LeaderBoardMineType, LeaderBoardMode, LeaderBoardType } from '@/types';

const PAGE_SIZE = 100;

type BoardState = {
  list: LeaderBoardType[];
  page: number;
  pageSize: number;
  total: number;
  pages: number;
  loading: boolean;
  mine: LeaderBoardMineType | null;
  mineFetched: boolean;
  mineResolved: boolean;
  mineOnly: boolean;
  loadError: boolean;
};

function createBoard(): BoardState {
  return {
    list: [],
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    pages: 0,
    loading: true,
    mine: null,
    mineFetched: false,
    mineResolved: false,
    mineOnly: false,
    loadError: false
  };
}

const useConfig = useConfigStore();
const { currentFont } = storeToRefs(useConfig);

const state = reactive({
  time: createBoard(),
  countdown: createBoard()
});

async function loadBoard(
  board: BoardState,
  type: LeaderBoardMode,
  page: number,
  append = false
) {
  // 追加下一页时避免重复请求；首屏 loading 初始就是 true，不能同样拦截
  if (append && board.loading) return;
  if (append && page !== board.page + 1) return;
  board.loading = true;
  board.loadError = false;
  try {
    const res = await getLeaderBoard({
      type,
      page,
      pageSize: board.pageSize || PAGE_SIZE
    });
    const result = res.data?.result;
    const list = (result?.list ?? []) as LeaderBoardType[];
    if (append) {
      const seen = new Set(board.list.map((item) => item.objectId));
      board.list = board.list.concat(list.filter((item) => !seen.has(item.objectId)));
    } else {
      board.list = list;
    }
    board.page = result?.page ?? page;
    board.pageSize = result?.pageSize ?? PAGE_SIZE;
    board.total = result?.total ?? 0;
    board.pages = result?.pages ?? 0;
    if (!append) {
      board.mine = result?.mine ?? null;
      board.mineFetched = true;
      // 没带 mineResolved 的旧接口，当成已经查过名次
      board.mineResolved = result?.mineResolved !== false;
    }
  } catch (error) {
    console.error('getLeaderBoard', type, error);
    board.loadError = true;
    if (!append && !board.list.length) {
      board.list = [];
      board.total = 0;
      board.pages = 0;
      board.mine = null;
      board.mineFetched = false;
      board.mineResolved = false;
    }
  } finally {
    board.loading = false;
  }
}

function loadMore(board: BoardState, type: LeaderBoardMode) {
  if (board.loading) return;
  // 首屏失败时从第一页重试；追加失败则继续要下一页
  if (!board.list.length) {
    loadBoard(board, type, 1, false);
    return;
  }
  if (board.pages > 0 && board.page >= board.pages) return;
  loadBoard(board, type, board.page + 1, true);
}

function toggleMine(board: BoardState) {
  if (!board.mineFetched || !board.mine) return;
  board.mineOnly = !board.mineOnly;
}

onMounted(() => {
  loadBoard(state.time, 'time', 1);
  loadBoard(state.countdown, 'countdown', 1);
});
</script>
<template>
  <main :class="'y-font--' + currentFont" class="y-leader-board">
    <div class="y-leader-board__wrap-title flex-center">
      <span>{{ $t('leaderboard') }}</span>
      <Tooltip style="cursor: pointer">
        <template #content>
          <div class="y-leader-board__tip y-leader-board__tip--wide">
            <p>{{ $t('sentence.leaderboard_rule1') }}</p>
            <p>{{ $t('sentence.leaderboard_rule2') }}</p>
          </div>
        </template>
        <IcoTips></IcoTips>
      </Tooltip>
    </div>
    <div class="y-leader-board__wrap">
      <LeaderBoardPanel
        :title="$t('limit_ranking')"
        :list="state.time.list"
        :page="state.time.page"
        :pages="state.time.pages"
        :loading="state.time.loading"
        :total="state.time.total"
        :mine="state.time.mine"
        :mine-fetched="state.time.mineFetched"
        :mine-resolved="state.time.mineResolved"
        :mine-only="state.time.mineOnly"
        :load-error="state.time.loadError"
        @load-more="loadMore(state.time, 'time')"
        @toggle-mine="toggleMine(state.time)"
      ></LeaderBoardPanel>
      <LeaderBoardPanel
        :title="$t('time_ranking')"
        :list="state.countdown.list"
        :page="state.countdown.page"
        :pages="state.countdown.pages"
        :loading="state.countdown.loading"
        :total="state.countdown.total"
        :mine="state.countdown.mine"
        :mine-fetched="state.countdown.mineFetched"
        :mine-resolved="state.countdown.mineResolved"
        :mine-only="state.countdown.mineOnly"
        :load-error="state.countdown.loadError"
        @load-more="loadMore(state.countdown, 'countdown')"
        @toggle-mine="toggleMine(state.countdown)"
      ></LeaderBoardPanel>
    </div>
    <div class="y-leader-board__bottom">
      *{{ $t('note') }}
      <ol>
        <li style="margin-bottom: 8px">
          {{ $t('sentence.leaderboard_rule1') }}
        </li>
        <li>{{ $t('sentence.leaderboard_rule3') }}</li>
      </ol>
    </div>
  </main>
</template>
<style lang="scss">
.y-leader-board {
  color: $gray-08;
  margin: 8px 6px 40px;
  font-weight: 500;
  letter-spacing: 0;
  svg {
    fill: $gray-08;
  }
}
.y-leader-board__wrap-title {
  font-size: 22px;
  margin-bottom: 24px;
  svg {
    width: 20px;
    height: 20px;
    margin-left: 4px;
    fill: $gray-06;
  }
}
.y-leader-board__wrap {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  min-height: 40vh;
}
.y-leader-board__item {
  flex: 1;
  min-width: 0;
  padding: 20px;
  background: $layout-background-gray;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  max-height: min(72vh, 840px);
}
.y-leader-board__scroller {
  flex: 1;
  min-height: 240px;
  overflow: auto;
  overscroll-behavior: contain;
}
.y-leader-board__header {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
  border-spacing: 0;
  td {
    padding: 8px 8px;
    white-space: nowrap;
    border-radius: $radius-sm;
  }
  thead td {
    position: sticky;
    top: 0;
    z-index: 1;
    background: $layout-background-gray;
    box-shadow: 0 1px 0 $background-gray;
  }
  tbody {
    position: relative;
    tr:nth-child(2n + 1) {
      background-color: $background-gray;
    }
    tr {
      transition: background-color 0.15s $ease-out;
      &:hover {
        background-color: $background-gray;
      }
    }
  }
}
.y-leader-board__title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.y-leader-board__title-main {
  min-width: 0;
}
.y-leader-board__tip {
  width: 280px;
  white-space: pre-wrap;
  p + p {
    margin-top: 6px;
  }
}
.y-leader-board__tip--wide {
  width: min(634px, 70vw);
}
.y-leader-board__count {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 500;
  color: $gray-04;
  white-space: nowrap;
  cursor: help;
}
.y-leader-board__mine-tip {
  flex-shrink: 0;
}
.y-leader-board__mine-btn {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: $main-color;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: $radius-sm;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: inset 0 0 0 1px $main-color;
  transition: background-color 0.15s $ease-out, color 0.15s $ease-out;
  &:hover {
    background: $background-gray;
  }
  &.is-active {
    background: $main-color;
    color: $label-white;
  }
}
.y-leader-board__mine-empty {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  color: $gray-04;
  white-space: nowrap;
}
.y-leader-board__status {
  text-align: center;
  padding: 28px 8px !important;
  background: transparent !important;
  &:hover {
    background: transparent !important;
  }
}
.y-leader-board__loading {
  margin: 0 auto;
}
.y-leader-board__more .y-loading,
.y-leader-board__loading--more.y-loading {
  width: 18px;
  height: 18px;
  border-width: 2px;
}
.y-leader-board__more {
  display: flex;
  justify-content: center;
  padding: 12px 0 4px;
}
.y-leader-board__retry {
  border: none;
  background: transparent;
  color: $main-color;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
}
.y-leader-board__sentinel {
  height: 1px;
}
.y-leader-board__empty {
  color: $gray-04;
  font-size: 13px;
  font-weight: 500;
}

.y-leader-board__bottom {
  margin: 50px 0 20px;
  font-size: 14px;
  color: $gray-04;
  li {
    margin-left: 20px;
  }
}
@media only screen and (max-width: 1199px) {
  .y-leader-board__wrap {
    flex-direction: column;
  }
  .y-leader-board__item {
    max-height: min(64vh, 640px);
  }
  .y-leader-board__header-finish-time {
    display: none;
  }
}
</style>
