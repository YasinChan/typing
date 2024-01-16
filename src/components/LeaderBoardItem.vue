<script lang="ts" setup>
import dayjs from 'dayjs';

// type
import type { LeaderBoardType } from '@/types';

// svg
import IcoChampion from '@/assets/svg/champion.svg';

const props = defineProps<{
  leaderBoardItem: LeaderBoardType;
  rank: number;
}>();
</script>
<template>
  <tr class="y-leader-board-item">
    <td v-if="rank === 1" class="y-leader-board-item__rank">
      <IcoChampion></IcoChampion>
    </td>
    <td v-else class="y-leader-board-item__rank">{{ rank }}</td>
    <td v-if="leaderBoardItem.userId">
      <router-link
        :to="{ name: 'User', params: { id: leaderBoardItem.userId } }"
        class="y-leader-board-item__user-name y-leader-board-item__user-name-link"
        >{{ leaderBoardItem.userName }}</router-link
      >
    </td>
    <td v-else class="y-leader-board-item__user-name">{{ leaderBoardItem.userName }}</td>
    <td class="y-leader-board-item__wpm">{{ leaderBoardItem.wpm }}</td>
    <td class="y-leader-board-item__accuracy">{{ leaderBoardItem.accuracy }}</td>
    <td class="y-leader-board-item__duration">{{ leaderBoardItem.duration }}</td>
    <td class="y-leader-board-item__created-at">
      {{ dayjs(leaderBoardItem.createdAt).format('YYYY-MM-DD HH:mm') }}
    </td>
  </tr>
</template>
<style lang="scss">
.y-leader-board-item {
  font-size: 12px;
}
.y-leader-board-item__rank {
  svg {
    width: 12px;
    height: 12px;
  }
}
.y-leader-board-item__user-name-link {
  &:hover {
    text-decoration: underline;
  }
}
</style>
