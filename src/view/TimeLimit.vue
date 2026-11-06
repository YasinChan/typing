<script setup lang="ts">
import { reactive, watch, ref, onUnmounted, nextTick, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// components
import WordInput from '@/components/WordInput.vue';
import YModal from '@/components/ui/Modal.vue';
import ResultContent from '@/components/ResultContent.vue';
import TypingChip from '@/components/typing/TypingChip.vue';
import TypingToolbar, {
  TypingChipGroup,
  TypingToolbarDivider
} from '@/components/typing/TypingToolbar.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import DetailModal from '@/components/DetailModal.vue';
import CustomTextModal from '@/components/typing/CustomTextModal.vue';
import { getCustomTextKey } from '@/common/custom-text';
import { listCustomTexts, type CustomTextRecord } from '@/common/custom-text-db';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';

// types
import type { PresetQuote, TypingRecordType } from '@/types';

// svg
import IcoChange from '@/assets/svg/change.svg';
import IcoUpload from '@/assets/svg/upload.svg';
import YInput from '@/components/ui/Input.vue';
import { handleChart } from '@/common/chart';
import { getRandomNonRepeatingElement } from '@/utils/common';

const router = useRouter();
const { t } = useI18n();

const wordInputRef = ref<any>(null);
const detailModalRef = ref<any>(null);
const useConfig = useConfigStore();
const { currentFont, isEscape } = storeToRefs(useConfig);
const customTime = [15, 30, 60, 120];

const showSourceModal = ref(false);
const sourceTab = ref<'preset' | 'local'>('preset');

const state = reactive({
  typingChartSpeed: [] as number[],
  lastTypingChartSpeed: [] as number[],
  typingChartAccuracy: [] as number[],
  lastTypingChartAccuracy: [] as number[],
  showDetail: false,
  showSetTime: false,
  isSpaceType: false,
  quote: {} as any,
  selectTime: 15 as number, // 设置的倒计时
  usedTime: 15 as number, // 本次实际用时（提前打完时小于 selectTime）
  showCountDown: true,
  countDown: null as null | number, // 实时倒计时
  errorText: '',
  setCountDown: '' as any, // 自定义的倒计时
  isTyping: false,
  intervalId: null as null | number,
  showResult: false,
  typingRecord: {} as TypingRecordType,
  source: 'preset' as 'preset' | 'local',
  localRecord: null as CustomTextRecord | null,
  lastLocalRecord: null as CustomTextRecord | null
});

const usingLocal = computed(() => state.source === 'local' && !!state.localRecord);
const localText = computed(() => state.localRecord?.content || '');
const sourcePickerLabel = computed(() =>
  usingLocal.value
    ? state.localRecord?.name || t('local_text')
    : state.quote?.title || t('preset_text')
);

const activeContent = computed(() => (usingLocal.value ? localText.value : state.quote?.content));
const activeChartKey = computed(() =>
  usingLocal.value ? getCustomTextKey(localText.value) : state.quote?.title
);

const id = router.currentRoute?.value?.query?.id;

if (id) {
  state.quote = Sentence.long.find((item) => item.id === Number(id));
} else {
  state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));
}

onMounted(async () => {
  await nextTick();
  wordInputRef.value?.focusInput();
});

onUnmounted(() => {
  state.countDown = null;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
});

function finishTyping() {
  if (!state.isTyping && !state.showResult) return;
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  wordInputRef.value?.typingEnd();
  state.typingRecord = wordInputRef.value?.getTypingRecord() || {};
  const remain = state.countDown;
  state.usedTime = remain == null ? state.selectTime : Math.max(state.selectTime - remain, 1);
  const typingChartRecord = wordInputRef.value?.getTypingChartRecord();
  const currentTitle = activeChartKey.value;
  const { typingChartSpeed, lastTypingChartSpeed, typingChartAccuracy, lastTypingChartAccuracy } =
    handleChart(typingChartRecord, currentTitle);
  state.typingChartSpeed = typingChartSpeed;
  state.lastTypingChartSpeed = lastTypingChartSpeed;
  state.typingChartAccuracy = typingChartAccuracy;
  state.lastTypingChartAccuracy = lastTypingChartAccuracy;
  state.isTyping = false;
  state.showResult = true;
}

watch(
  () => isEscape.value,
  (val) => {
    if (val && state.isTyping) finishTyping();
  }
);

watch(
  () => state.isTyping,
  (val) => {
    if (val && state.selectTime) {
      state.countDown = state.selectTime;
      state.intervalId = setInterval(() => {
        // console.log(`剩余时间：${state.countDown} 秒`);

        if (state.countDown) {
          state.countDown -= 1;
          if (state.countDown < 1) finishTyping();
        }
      }, 1000);
    } else {
      // message({ message: '已结束' });
      state.countDown = null;
      if (state.intervalId !== null) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    }
  }
);

watch(showSourceModal, (show) => {
  if (!show) nextTick(() => wordInputRef.value?.focusInput());
});

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

function refresh() {
  if (usingLocal.value) return;
  state.isTyping = false;
  state.quote = getRandomNonRepeatingElement(Object.values(Sentence.long));
  nextTick(() => wordInputRef.value?.focusInput());
}

function selectTime(time: number) {
  state.selectTime = time;
  state.isTyping = false;
  nextTick(() => wordInputRef.value?.focusInput());
}

function openCustomTime() {
  state.setCountDown = String(state.selectTime);
  state.errorText = '';
  state.showSetTime = true;
}

function isTypingFunc() {
  state.isTyping = true;
}

function setTime() {
  if (!state.setCountDown) {
    state.showSetTime = false;
    return;
  }
  // @ts-ignore
  if (!/\d+/.test(Number(state.setCountDown))) {
    state.errorText = '请输入数字';
    return;
  }
  state.isTyping = false;
  state.showSetTime = false;
  state.selectTime = Number(state.setCountDown);
  nextTick(() => wordInputRef.value?.focusInput());
}
function restart() {
  state.isTyping = false;
  state.showResult = false;
  state.usedTime = state.selectTime;
}

function changePunctuation() {
  if (usingLocal.value) return;
  // 与英文标点开关一致：同一篇就地切换，不换文、不重开计时
  state.isSpaceType = !state.isSpaceType;
  if (state.isTyping) state.isTyping = false;
  nextTick(() => wordInputRef.value?.focusInput());
}

function openSource(tab: 'preset' | 'local') {
  sourceTab.value = tab;
  showSourceModal.value = true;
}

function resetSource() {
  state.isTyping = false;
  state.showResult = false;
  state.countDown = null;
  state.usedTime = state.selectTime;
  nextTick(() => wordInputRef.value?.focusInput());
}

async function switchSource(tab: 'preset' | 'local') {
  if (tab === 'preset') {
    if (!usingLocal.value) return;
    state.localRecord = null;
    state.source = 'preset';
    resetSource();
    return;
  }
  if (usingLocal.value) return;
  if (state.lastLocalRecord) {
    state.localRecord = state.lastLocalRecord;
    state.source = 'local';
    resetSource();
    return;
  }
  try {
    const records = await listCustomTexts();
    if (records.length) {
      state.lastLocalRecord = records[0];
      state.localRecord = records[0];
      state.source = 'local';
      resetSource();
      return;
    }
  } catch (error) {
    console.error('load local texts failed', error);
  }
  openSource('local');
}

function applyPreset(quote: PresetQuote) {
  state.source = 'preset';
  state.localRecord = null;
  state.quote = quote;
  resetSource();
}

function applyLocal(record: CustomTextRecord) {
  state.source = 'local';
  state.localRecord = record;
  state.lastLocalRecord = record;
  resetSource();
}

function onLocalUpdated(record: CustomTextRecord) {
  if (state.lastLocalRecord?.id === record.id) state.lastLocalRecord = record;
  if (state.localRecord?.id !== record.id) return;
  state.localRecord = record;
  if (state.source === 'local') {
    state.isTyping = false;
    state.showResult = false;
  }
}

function onLocalDeleted(id: string) {
  if (state.lastLocalRecord?.id === id) state.lastLocalRecord = null;
  if (state.localRecord?.id !== id) return;
  state.localRecord = null;
  state.source = 'preset';
  resetSource();
}

function reset() {
  router.push('/');
  refresh();
}
</script>
<template>
  <main class="y-time-limit" :class="'y-font--' + currentFont">
    <div v-if="!state.showResult" class="y-typing-stage">
      <div class="y-time-limit__setting y-typing-setting">
        <div
          v-if="(state.countDown || state.selectTime) && state.showCountDown"
          class="y-typing-timer"
          :class="{
            'is-active': !!state.countDown,
            'is-urgent': !!state.countDown && state.countDown <= 5
          }"
        >
          {{ state.countDown || state.selectTime }}
        </div>
        <TypingToolbar>
          <TypingChipGroup class="y-source-switch">
            <TypingChip :active="!usingLocal" @click="switchSource('preset')">
              {{ $t('preset_source') }}
            </TypingChip>
            <TypingChip :active="usingLocal" @click="switchSource('local')">
              {{ $t('local_source') }}
            </TypingChip>
          </TypingChipGroup>
          <TypingChip
            class="y-source-picker"
            aria-haspopup="dialog"
            :title="sourcePickerLabel"
            @click="openSource(usingLocal ? 'local' : 'preset')"
          >
            <span class="y-source-picker__text">{{ sourcePickerLabel }}</span>
          </TypingChip>
          <TypingChip v-if="!usingLocal" class="y-source-refresh" @click="refresh">
            <IcoChange></IcoChange>
            {{ $t('change_passage') }}
          </TypingChip>
          <TypingChip class="y-source-import" @click="openSource('local')">
            <IcoUpload></IcoUpload>
            {{ usingLocal ? $t('manage_local_text') : $t('import_local_text') }}
          </TypingChip>
          <TypingToolbarDivider />
          <TypingChip v-if="!usingLocal" :active="!state.isSpaceType" @click="changePunctuation">
            @ {{ $t('punctuation') }}
          </TypingChip>
          <TypingToolbarDivider v-if="!usingLocal" />
          <Tooltip :content="$t('select_countdown')">
            <TypingChipGroup>
              <TypingChip
                v-for="item in customTime"
                :key="item"
                :active="state.selectTime === item"
                @click="selectTime(item)"
              >
                {{ item }}
              </TypingChip>
              <TypingChip
                :active="!customTime.includes(state.selectTime)"
                :title="$t('custom_countdown')"
                @click="openCustomTime"
              >
                {{
                  customTime.includes(state.selectTime) ? $t('custom_time') : `${state.selectTime}s`
                }}
              </TypingChip>
            </TypingChipGroup>
          </Tooltip>
          <TypingToolbarDivider />
          <TypingChip
            :active="state.showCountDown"
            :title="$t('display_countdown')"
            @click="state.showCountDown = !state.showCountDown"
          >
            {{ $t('display_countdown') }}
          </TypingChip>
          <TypingChip v-if="router.currentRoute?.value?.query?.id" @click="reset">
            {{ $t('reset') }}
          </TypingChip>
        </TypingToolbar>
      </div>
      <WordInput
        ref="wordInputRef"
        :is-space-type="usingLocal ? false : state.isSpaceType"
        :can-space="usingLocal"
        :quote="activeContent"
        @is-typing="isTypingFunc"
        @is-finished="finishTyping"
        @refresh="refresh"
      ></WordInput>
      <div v-if="!usingLocal" class="y-time-limit__info y-quote-meta">
        ——
        <span class="y-time-limit__info-title">
          {{ state.quote?.title }}
        </span>
        -
        <span class="y-time-limit__info-author">
          {{ state.quote?.author }}
        </span>
      </div>
      <Transition v-if="!usingLocal" name="menu">
        <div class="y-time-limit__detail y-quote-more">
          <span @click="detailModalRef?.setShowDetail()">{{ $t('view_full') }}</span>
        </div>
      </Transition>
      <div class="y-typing-tips">
        <p v-if="!usingLocal">*{{ $t('sentence.word_tip') }}</p>
        <p v-if="usingLocal">*{{ $t('local_tip') }}</p>
      </div>
    </div>
    <template v-else>
      <div v-if="usingLocal" class="y-local-result-note">{{ $t('local_result_note') }}</div>
      <ResultContent
        type="time"
        :show-save-record="!usingLocal"
        :typing-record="state.typingRecord"
        @restart="restart"
        :total-time="state.usedTime"
        :is-positive="false"
        :chart-speed="state.typingChartSpeed"
        :last-chart-speed="state.lastTypingChartSpeed"
        :chart-accuracy="state.typingChartAccuracy"
        :last-chart-accuracy="state.lastTypingChartAccuracy"
      ></ResultContent>
    </template>
  </main>
  <YModal :show="state.showSetTime" @close="state.showSetTime = false" @confirm="setTime">
    <template #header>
      <h3>{{ $t('custom_countdown') }}</h3>
    </template>
    <template #body>
      <div class="time-limit__container">
        <YInput
          :error-text="state.errorText"
          class="time-limit__q"
          v-model="state.setCountDown"
          :placeholder="$t('enter_countdown')"
        ></YInput>
      </div>
    </template>
  </YModal>
  <DetailModal ref="detailModalRef" :quote="state.quote"></DetailModal>
  <CustomTextModal
    v-model:show="showSourceModal"
    :initial-tab="sourceTab"
    :active-local-id="state.localRecord?.id || ''"
    :active-preset-title="!usingLocal ? state.quote?.title || '' : ''"
    :allowed-preset-lengths="['long']"
    @select-preset="applyPreset"
    @select-local="applyLocal"
    @local-updated="onLocalUpdated"
    @local-deleted="onLocalDeleted"
  />
</template>
<style lang="scss">
.time-limit__container {
  color: $gray-06;
  font-size: 14px;
}
</style>
