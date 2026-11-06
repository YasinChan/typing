<script setup lang="ts">
import { reactive, nextTick, ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// components
import WordInput from '@/components/WordInput.vue';
import DetailModal from '@/components/DetailModal.vue';
import TypingChip from '@/components/typing/TypingChip.vue';
import TypingToolbar, {
  TypingChipGroup,
  TypingToolbarDivider
} from '@/components/typing/TypingToolbar.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import ResultContent from '@/components/ResultContent.vue';
import CustomTextModal from '@/components/typing/CustomTextModal.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';

// svg
import IcoChange from '@/assets/svg/change.svg';
import IcoUpload from '@/assets/svg/upload.svg';

// config
import { KEY_CODE_ENUM } from '@/config/key';
import type { PresetQuote, TypingRecordType } from '@/types';

// common
import { handleChart } from '@/common/chart';
import { getCustomTextKey } from '@/common/custom-text';
import { listCustomTexts, type CustomTextRecord } from '@/common/custom-text-db';

const { t } = useI18n();
const wordInputRef = ref<any>(null);
const wordInputShortRef = ref<any>(null);
const detailModalRef = ref<any>(null);
const useConfig = useConfigStore();
const { currentFont, isEscape } = storeToRefs(useConfig);
const quoteLength = [5, 10];

const showSourceModal = ref(false);
const sourceTab = ref<'preset' | 'local'>('preset');
const typeList = computed(() => [
  {
    type: 'short',
    name: t('short_sentence')
  },
  {
    type: 'medium',
    name: t('medium_sentence')
  },
  {
    type: 'long',
    name: t('long_sentence')
  }
]);

const state = reactive({
  typingChartSpeed: [] as number[],
  lastTypingChartSpeed: [] as number[],
  typingChartAccuracy: [] as number[],
  lastTypingChartAccuracy: [] as number[],
  quotes: null as any, // [] 或 {}
  isTyping: false,
  isSpaceType: false,
  intervalId: null as null | number,
  lastIndex: -1,
  len: 5,
  type: 'medium' as 'short' | 'long' | 'medium',
  time: 0 as number,
  showTime: true,
  showResult: false,
  typingRecord: {} as TypingRecordType,
  typingRecordArr: [] as TypingRecordType[],
  currentIndex: 0, // 当前显示的句子的索引
  source: 'preset' as 'preset' | 'local',
  localRecord: null as CustomTextRecord | null,
  lastLocalRecord: null as CustomTextRecord | null
});

const usingLocal = computed(() => state.source === 'local' && !!state.localRecord);
const localText = computed(() => state.localRecord?.content || '');
const sourcePickerLabel = computed(() => {
  if (usingLocal.value) return state.localRecord?.name || t('local_text');
  const quote = Array.isArray(state.quotes)
    ? state.quotes[state.currentIndex] || state.quotes[0]
    : state.quotes;
  return quote?.title || t('preset_text');
});

state.quotes = getRandom();

const isShort = computed(() => state.type === 'short' && !usingLocal.value);
const activeContent = computed(() => (usingLocal.value ? localText.value : state.quotes?.content));
const activeChartKey = computed(() =>
  usingLocal.value ? getCustomTextKey(localText.value) : state.quotes?.title
);

onMounted(async () => {
  await nextTick();
  wordInputRef.value?.focusInput();
});

onUnmounted(() => {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
});

watch(
  () => isEscape.value,
  (val) => {
    if (val && state.isTyping) {
      finished();
    }
  }
);

watch(showSourceModal, (show) => {
  if (!show) {
    nextTick(() => {
      wordInputRef.value?.focusInput();
      wordInputShortRef.value?.focusInput();
    });
  }
});

watch(
  () => state.isTyping,
  (val) => {
    if (val) {
      state.time = 0;
      state.intervalId = setInterval(() => {
        state.time += 0.1;
      }, 100);
    } else {
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
      wordInputRef.value?.typingEnd();
    }
  }
);

const timeFormat = computed(() => {
  const time = Number(state.time.toFixed(1));
  if (time && time % 1 === 0) {
    return time + '.0';
  } else {
    return time;
  }
});

async function refresh() {
  if (usingLocal.value) return;
  state.isTyping = false;
  state.time = 0;
  state.quotes = null;
  state.currentIndex = 0;
  state.typingRecordArr = [];
  await nextTick();
  state.quotes = getRandom();
  await nextTick();
  wordInputRef.value?.focusInput();
  wordInputShortRef.value?.focusInput();
}

function getRandom() {
  const array = Object.values(Sentence[state.type]);
  if (state.type === 'short') {
    if (array.length < state.len) {
      throw new Error('The array length should be at least 5');
    }

    // 创建一个包含原数组所有索引的数组
    const indices = Array.from({ length: array.length }, (_, i) => i);

    // 使用 Fisher-Yates 洗牌算法打乱索引数组
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // 选取前 length 个随机索引，并从原数组中获取对应元素
    return indices.slice(0, state.len).map((index) => array[index]);
  } else {
    if (array.length === 0) {
      return null;
    }
    if (array.length === 1) {
      return array[0];
    }

    let randomIndex: number = state.lastIndex;

    while (randomIndex === state.lastIndex) {
      randomIndex = Math.floor(Math.random() * array.length);
    }

    state.lastIndex = randomIndex;
    return array[randomIndex];
  }
}
function isTypingFunc() {
  state.isTyping = true;
}
function selectLen(len: number) {
  state.len = len;
  refresh();
}
function selectType(type: any) {
  state.type = type;
  refresh();
}
function keyDownEvent(e: any) {
  if (e.code === KEY_CODE_ENUM['ENTER']) {
    next();
  }
  // if (e.code === KEY_CODE_ENUM['BACKSPACE']) {
  //   if (state.currentIndex > 0) {
  //     state.currentIndex -= 1;
  //   }
  // }
}
function finished() {
  state.isTyping = false;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.showResult = true;
  if (isShort.value) {
    state.typingRecordArr.push(wordInputShortRef.value?.getTypingRecord());
  } else {
    state.typingRecord = wordInputRef.value?.getTypingRecord();

    // 处理图表数据
    const typingChartRecord = wordInputRef.value?.getTypingChartRecord();
    const currentTitle = activeChartKey.value;
    const { typingChartSpeed, lastTypingChartSpeed, typingChartAccuracy, lastTypingChartAccuracy } =
      handleChart(typingChartRecord, currentTitle);

    state.typingChartSpeed = typingChartSpeed;
    state.lastTypingChartSpeed = lastTypingChartSpeed;
    state.typingChartAccuracy = typingChartAccuracy;
    state.lastTypingChartAccuracy = lastTypingChartAccuracy;
  }
}

function next() {
  if (state.currentIndex >= state.len - 1) {
    finished();
    return;
  }
  state.typingRecordArr.push(wordInputShortRef.value?.getTypingRecord());
  if (state.currentIndex < state.quotes.length - 1) {
    state.currentIndex += 1;
  }
}

function restart() {
  state.isTyping = false;
  state.time = 0;
  state.showResult = false;
  state.currentIndex = 0;
}

function openSource(tab: 'preset' | 'local') {
  sourceTab.value = tab;
  showSourceModal.value = true;
}

function resetSource() {
  state.isTyping = false;
  state.time = 0;
  state.showResult = false;
  state.currentIndex = 0;
  state.typingRecordArr = [];
  nextTick(() => {
    wordInputRef.value?.focusInput();
    wordInputShortRef.value?.focusInput();
  });
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
  if (quote.length === 'short') {
    state.type = 'short';
    state.len = 1;
    state.quotes = [quote];
    state.currentIndex = 0;
  } else {
    state.type = quote.length;
    state.quotes = quote;
  }
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

function changePunctuation() {
  if (usingLocal.value) return;
  // 与英文标点开关一致：同一篇就地切换，不换文、不重开计时
  state.isSpaceType = !state.isSpaceType;
  if (state.isTyping) state.isTyping = false;
  nextTick(() => wordInputRef.value?.focusInput());
}
</script>
<template>
  <main :class="'y-font--' + currentFont" class="y-quote-limit">
    <div v-if="!state.showResult" class="y-typing-stage">
      <div class="y-quote-limit__setting-wrap">
        <div v-if="state.showTime" class="y-typing-timer" :class="{ 'is-active': !!timeFormat }">
          {{ timeFormat || 0 }}
        </div>
        <div class="y-quote-limit__setting y-typing-setting">
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
            <template v-if="!usingLocal">
              <TypingChip v-if="!isShort" :active="!state.isSpaceType" @click="changePunctuation">
                @ {{ $t('punctuation') }}
              </TypingChip>
              <TypingToolbarDivider v-if="!isShort" />
              <Tooltip content="选择句子类型">
                <TypingChipGroup>
                  <TypingChip
                    v-for="item in typeList"
                    :key="item.type"
                    :active="state.type === item.type"
                    @click="selectType(item.type)"
                  >
                    {{ item.name }}
                  </TypingChip>
                </TypingChipGroup>
              </Tooltip>
              <template v-if="isShort">
                <TypingToolbarDivider />
                <Tooltip content="选择数量">
                  <TypingChipGroup>
                    <TypingChip
                      v-for="item in quoteLength"
                      :key="item"
                      :active="state.len === item"
                      @click="selectLen(item)"
                    >
                      {{ item }}
                    </TypingChip>
                  </TypingChipGroup>
                </Tooltip>
              </template>
              <TypingToolbarDivider />
            </template>
            <TypingChip :active="state.showTime" @click="state.showTime = !state.showTime">
              {{ $t('display_timer') }}
            </TypingChip>
          </TypingToolbar>
        </div>
      </div>
      <template v-if="isShort">
        <WordInput
          v-if="state.quotes && state.quotes[state.currentIndex]"
          :quote="state.quotes[state.currentIndex]?.content"
          :show-mask="false"
          ref="wordInputShortRef"
          @is-typing="isTypingFunc"
          @is-finished="next"
          @keydown-event="keyDownEvent"
          @refresh="refresh"
        ></WordInput>
        <div class="y-quote-limit__content gray-04">
          <p
            v-for="(item, index) in state.quotes"
            :class="{ 'gray-08': index === state.currentIndex }"
            :key="item.title"
          >
            {{ item?.content }}
          </p>
        </div>
      </template>
      <template v-else>
        <WordInput
          ref="wordInputRef"
          v-if="state.quotes"
          :is-space-type="usingLocal ? false : state.isSpaceType"
          :can-space="usingLocal"
          :quote="activeContent"
          @is-typing="isTypingFunc"
          @is-finished="finished"
          @refresh="refresh"
          class-name="y-quote-limit__word-input"
        ></WordInput>
        <div v-if="!usingLocal" class="y-quote-limit__info y-quote-meta">
          ——
          <span class="y-quote-limit__info-title">
            {{ state.quotes?.title }}
          </span>
          -
          <span class="y-quote-limit__info-author">
            {{ state.quotes?.author }}
          </span>
        </div>
        <Transition v-if="!usingLocal" name="menu">
          <div class="y-quote-limit__detail y-quote-more" @click="detailModalRef?.setShowDetail()">
            {{ $t('view_full') }}
          </div>
        </Transition>
        <DetailModal v-if="!usingLocal" ref="detailModalRef" :quote="state.quotes"></DetailModal>
      </template>
      <Transition name="menu">
        <div class="y-quote-limit__tips y-typing-tips">
          <p v-if="!usingLocal">*{{ $t('sentence.word_tip') }}</p>
          <p v-if="isShort">*{{ $t('sentence.short_enter_tip') }}</p>
          <p v-if="usingLocal">*{{ $t('local_tip') }}</p>
        </div>
      </Transition>
    </div>
    <template v-else>
      <div v-if="usingLocal" class="y-local-result-note">{{ $t('local_result_note') }}</div>
      <ResultContent
        type="countdown"
        :show-save-record="!usingLocal"
        :typing-record="state.typingRecord"
        :typing-record-arr="state.typingRecordArr"
        @restart="restart"
        :total-time="state.time"
        :is-positive="true"
        :chart-speed="state.typingChartSpeed"
        :last-chart-speed="state.lastTypingChartSpeed"
        :chart-accuracy="state.typingChartAccuracy"
        :last-chart-accuracy="state.lastTypingChartAccuracy"
      ></ResultContent>
    </template>
  </main>
  <CustomTextModal
    v-model:show="showSourceModal"
    :initial-tab="sourceTab"
    :active-local-id="state.localRecord?.id || ''"
    :active-preset-title="
      !usingLocal && !Array.isArray(state.quotes) ? state.quotes?.title || '' : ''
    "
    :allowed-preset-lengths="['medium', 'long']"
    @select-preset="applyPreset"
    @select-local="applyLocal"
    @local-updated="onLocalUpdated"
    @local-deleted="onLocalDeleted"
  />
</template>
<style lang="scss">
.y-quote-limit {
  .y-word-input {
    width: 100%;
  }
}
.y-quote-limit__setting-wrap {
  position: relative;
}
.y-quote-limit__content {
  margin-top: 24px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.8;
  p + p {
    margin-top: 8px;
  }
}
</style>
