<script setup lang="ts">
import { reactive, nextTick, ref, watch, onMounted, onUnmounted, computed } from 'vue';

// components
import Tooltip from '@/components/ui/Tooltip.vue';
import LeaderBoardItem from '@/components/LeaderBoardItem.vue';
import YLoading from '@/components/ui/Loading.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// svg
import IcoTips from '@/assets/svg/tips.svg';

// apis
import { getLeaderBoard } from '@/request';

// type
import type { LeaderBoardType } from '@/types';

const useConfig = useConfigStore();
const { currentFont } = storeToRefs(useConfig);

const state = reactive({
  timeLeaderBoard: [] as LeaderBoardType[],
  countdownLeaderBoard: [] as LeaderBoardType[]
});

onMounted(async () => {
  const res = await getLeaderBoard();
  const leaderboard = res.data.result?.leaderboard;
  state.timeLeaderBoard = removeDuplicates(leaderboard['time'], 'userName');
  state.countdownLeaderBoard = removeDuplicates(leaderboard['countdown'], 'userName');
});

function removeDuplicates<T extends Record<K, any>, K extends keyof any>(array: T[], key: K): T[] {
  if (!array || !array.length) {
    return [];
  }
  const map = new Map<string | number | symbol, T>();
  const result: T[] = [];

  for (const item of array) {
    if (!map.has(item[key])) {
      map.set(item[key], item);
      result.push(item);
    }
  }

  return result;
}
</script>
<template>
  <main :class="'y-font--' + currentFont" class="y-leader-board">
    <div class="y-leader-board__wrap-title flex-center">
      <span>排行榜</span>
      <Tooltip
        style="cursor: pointer"
        html="速度的计算规则为「总字数/总时间(秒)*60」，即每分钟输入的字数，其中总字数包含标点符号，不包括空格。<br>排行榜仅保留速度最快的记录。"
      >
        <IcoTips></IcoTips>
      </Tooltip>
    </div>
    <div class="y-leader-board__wrap">
      <div class="y-leader-board__item y-leader-board__time">
        <div class="y-leader-board__title flex-center--y">
          <span>限时排行</span>
        </div>
        <table class="y-leader-board__header">
          <thead>
            <tr>
              <td>排行</td>
              <td>昵称</td>
              <td>速度</td>
              <td>准确率</td>
              <td>时长</td>
              <td class="y-leader-board__header-finish-time">完成时间</td>
            </tr>
          </thead>
          <tbody>
            <template v-if="state.timeLeaderBoard?.length">
              <LeaderBoardItem
                v-for="(item, index) in state.timeLeaderBoard"
                :key="item.objectId"
                :rank="index + 1"
                :leader-board-item="item"
              ></LeaderBoardItem>
            </template>
            <YLoading v-else class="y-leader-board__loading"></YLoading>
          </tbody>
        </table>
      </div>
      <div class="y-leader-board__item y-leader-board__countdown">
        <div class="y-leader-board__title">计时排行</div>
        <table class="y-leader-board__header">
          <thead>
            <tr>
              <td>排行</td>
              <td>昵称</td>
              <td>速度</td>
              <td>准确率</td>
              <td>时长</td>
              <td class="y-leader-board__header-finish-time">完成时间</td>
            </tr>
          </thead>
          <tbody>
            <template v-if="state.countdownLeaderBoard?.length">
              <LeaderBoardItem
                v-for="(item, index) in state.countdownLeaderBoard"
                :key="item.objectId"
                :rank="index + 1"
                :leader-board-item="item"
              ></LeaderBoardItem>
            </template>
            <YLoading v-else class="y-leader-board__loading"></YLoading>
          </tbody>
        </table>
      </div>
    </div>
    <div class="y-leader-board__bottom">
      *注：
      <ol>
        <li>
          速度的计算规则为「总字数/总时间(秒)*60」，即每分钟输入的字数，其中总字数包含标点符号，不包括空格。
        </li>
        <li>排行榜仅保留同一用户或同一 IP 下速度最快的记录。</li>
      </ol>
    </div>
  </main>
</template>
<style lang="scss">
.y-leader-board {
  color: $gray-08;
  margin: 40px 6px;
  svg {
    fill: $gray-08;
  }
}
.y-leader-board__wrap-title {
  font-size: 20px;
  margin-bottom: 20px;
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
  min-height: 40vh;
}
.y-leader-board__item {
  width: 48%;
}
.y-leader-board__header {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
  border-spacing: 0;
  td {
    padding: 4px 6px;
    white-space: nowrap;
    border-radius: 2px;
  }
  tbody {
    position: relative;
    tr:nth-child(2n + 1) {
      background-color: $layout-background-gray;
    }
  }
}
.y-leader-board__title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}
.y-leader-board__loading {
  position: absolute;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
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
  .y-leader-board__header-finish-time {
    display: none;
  }
}
</style>
