<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TypingRecordItemType, TypingRecordType } from '@/types';
import {
  buildEnglishLetters,
  buildEnglishRecordItem,
  createEnglishPassageStream,
  createEnglishWordItems,
  type EnglishWordItem,
  type EnglishWordOptions
} from '@/common/english';
import { useTypingChartSampler } from '@/composables/use-typing-chart-sampler';

// 420px 窗口约 7 行可见词，预填足够多以免刚开始就触底
const INITIAL_COUNT = 160;
const APPEND_COUNT = 80;
const LINE_BUFFER = 2;

const props = withDefaults(
  defineProps<{
    punctuation?: boolean;
  }>(),
  {
    punctuation: true
  }
);

const emit = defineEmits(['is-typing', 'is-finished', 'refresh']);
const { t } = useI18n();

const inputRef = ref<HTMLInputElement | null>(null);
const wrapRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);
const wordEls: HTMLElement[] = [];
const isFocused = ref(false);
const showStartHint = ref(false);
const scrollY = ref(0);
const hasOpenModal = ref(false);
const caretStyle = ref({ left: '0px', top: '0px', height: '22px', opacity: '0' });
let hintTimer: number | null = null;
let modalObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;

const state = reactive({
  words: [] as EnglishWordItem[],
  currentIndex: 0,
  isTyping: false,
  startTime: 0,
  typingRecord: {} as TypingRecordType
});

const options = computed<EnglishWordOptions>(() => ({
  punctuation: props.punctuation
}));
const passageStream = createEnglishPassageStream();

function getStats() {
  let total = 0;
  let wrong = 0;
  state.words.forEach((word, index) => {
    if (!word.submitted && index !== state.currentIndex) return;
    if (!word.typed && !word.submitted) return;
    const record = buildEnglishRecordItem(word);
    total += record.word.length;
    wrong += record.wrongPos.length;
  });
  return { total, wrong, correct: total - wrong };
}

const chartSampler = useTypingChartSampler(
  {
    wordLength: () => getStats().total,
    wrongLength: () => getStats().wrong
  },
  1000,
  5
);

function setWordRef(index: number, el: unknown) {
  if (el instanceof HTMLElement) {
    wordEls[index] = el;
  } else {
    delete wordEls[index];
  }
}

function resetWords() {
  wordEls.length = 0;
  passageStream.reset(options.value);
  state.words = createEnglishWordItems(INITIAL_COUNT, options.value, passageStream);
  state.currentIndex = 0;
  state.isTyping = false;
  state.startTime = 0;
  state.typingRecord = {};
  scrollY.value = 0;
  chartSampler.stop();
  if (inputRef.value) inputRef.value.value = '';
  afterRender();
}

function ensureWords() {
  // 七可见行大约 70+ 词，剩余不足 100 时提前补词避免滚动空窗
  if (state.words.length - state.currentIndex > 100) return;
  const extra = createEnglishWordItems(APPEND_COUNT, options.value, passageStream);
  state.words.push(...extra);
}

/** 标点开关：同一篇文稿原地重分词，不重置计时和进度 */
function applyWordOptions() {
  passageStream.setOptions(options.value);
  if (!state.isTyping) {
    passageStream.setCursor(0);
    wordEls.length = 0;
    state.words = createEnglishWordItems(INITIAL_COUNT, options.value, passageStream);
    state.currentIndex = 0;
    scrollY.value = 0;
    if (inputRef.value) inputRef.value.value = '';
    afterRender();
    return;
  }
  const current = state.words[state.currentIndex];
  // 当前词已输入时从下一个词开始换，避免光标和已打内容对不上
  const replaceFrom = current?.typed ? state.currentIndex + 1 : state.currentIndex;
  const startAt = state.words[replaceFrom]?.rawIndex ?? (current ? current.rawIndex + 1 : 0);
  passageStream.setCursor(startAt);
  const extra = createEnglishWordItems(
    Math.max(INITIAL_COUNT, state.words.length - replaceFrom),
    options.value,
    passageStream
  );
  const first = extra[0];
  const keep = state.words[replaceFrom];
  if (first && keep && first.rawIndex === keep.rawIndex) {
    first.typed = keep.typed;
    first.submitted = keep.submitted;
  }
  wordEls.length = replaceFrom;
  state.words.splice(replaceFrom, state.words.length - replaceFrom, ...extra);
  afterRender();
}

function snapshot() {
  if (!state.startTime) return;
  const relative = Math.floor((Date.now() - state.startTime) / 100);
  const records: TypingRecordItemType[] = [];
  state.words.forEach((word, index) => {
    if (index > state.currentIndex) return;
    if (!word.typed && !word.submitted) return;
    records.push(buildEnglishRecordItem(word));
  });
  state.typingRecord[relative] = records;
}

function startIfNeeded() {
  if (state.isTyping) return;
  state.isTyping = true;
  state.startTime = Date.now();
  emit('is-typing');
  chartSampler.start();
}

function syncScroll() {
  const current = wordEls[state.currentIndex];
  const wrap = wrapRef.value;
  if (!current || !wrap) return;
  const lineHeight = current.offsetHeight;
  if (!lineHeight) return;
  const top = current.offsetTop;
  if (top - scrollY.value >= lineHeight * LINE_BUFFER) {
    scrollY.value = top - lineHeight;
  }
}

/** 按当前字母实测位置摆光标，避免伪元素跟着行高跑偏 */
function updateCaret() {
  const track = trackRef.value;
  const wordEl = wordEls[state.currentIndex];
  const word = state.words[state.currentIndex];
  if (!track || !wordEl || !word || !isFocused.value) {
    caretStyle.value = { ...caretStyle.value, opacity: '0' };
    return;
  }
  const letters = wordEl.querySelectorAll('.y-en-letter');
  const at = word.typed.length;
  const target = (letters[at] || letters[letters.length - 1]) as HTMLElement | undefined;
  if (!target) {
    caretStyle.value = { ...caretStyle.value, opacity: '0' };
    return;
  }
  const trackRect = track.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  const atEnd = at >= letters.length;
  const left = (atEnd ? rect.right : rect.left) - trackRect.left;
  const height = Math.max(rect.height * 0.72, 18);
  const top = rect.top - trackRect.top + (rect.height - height) / 2;
  caretStyle.value = {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    height: `${Math.round(height)}px`,
    opacity: '1'
  };
}

function afterRender() {
  nextTick(() => {
    syncScroll();
    updateCaret();
  });
}

function submitWord() {
  const word = state.words[state.currentIndex];
  if (!word || !word.typed) return;
  startIfNeeded();
  word.submitted = true;
  state.currentIndex += 1;
  ensureWords();
  if (inputRef.value) inputRef.value.value = '';
  snapshot();
  afterRender();
}

function goBackToPrevError() {
  if (state.currentIndex <= 0) return;
  const prev = state.words[state.currentIndex - 1];
  if (!prev.submitted || prev.typed === prev.text) return;
  prev.submitted = false;
  state.currentIndex -= 1;
  if (inputRef.value) {
    inputRef.value.value = prev.typed;
  }
  snapshot();
  afterRender();
}

function onKeydown(e: KeyboardEvent) {
  if (hasOpenModal.value) return;
  if (e.key === 'Tab') {
    e.preventDefault();
    emit('refresh');
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    if (state.isTyping) emit('is-finished');
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    return;
  }
  if (e.key === ' ') {
    e.preventDefault();
    submitWord();
    return;
  }
  if (e.key === 'Backspace' && !state.words[state.currentIndex]?.typed) {
    e.preventDefault();
    goBackToPrevError();
  }
}

function onInput(e: Event) {
  const input = e.target as HTMLInputElement;
  const value = input.value.replace(/\s+/g, '');
  if (value !== input.value) input.value = value;
  const word = state.words[state.currentIndex];
  if (!word) return;
  if (value) startIfNeeded();
  word.typed = value;
  snapshot();
  afterRender();
}

function focusInput() {
  inputRef.value?.focus();
  isFocused.value = true;
  afterRender();
}

function blurInput() {
  inputRef.value?.blur();
  isFocused.value = false;
}

function syncOpenModal() {
  hasOpenModal.value = !!document.querySelector('.y-modal__mask');
}

function onWindowKeyDown(e: KeyboardEvent) {
  if (document.querySelector('.y-modal__mask')) return;
  const target = e.target as HTMLElement | null;
  if (e.key === 'Tab') {
    // 未聚焦时 Tab 也换篇，和输入框内行为一致
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    e.preventDefault();
    emit('refresh');
    return;
  }
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.code === 'Escape' || e.code === 'Enter') return;
  if (e.key.length === 1 || e.code === 'Space' || e.code === 'Backspace') {
    e.preventDefault();
    focusInput();
  }
}

function onWrapMouseDown(e: MouseEvent) {
  if (hasOpenModal.value) return;
  e.preventDefault();
  focusInput();
}

function getTypingRecord() {
  return state.typingRecord;
}

function getTypingChartRecord() {
  return {
    accuracy: chartSampler.accuracyRecord.value,
    speed: chartSampler.speedRecord.value
  };
}

function typingEnd() {
  const word = state.words[state.currentIndex];
  if (word?.typed) word.submitted = true;
  state.isTyping = false;
  chartSampler.stop();
  snapshot();
}

watch(
  () => props.punctuation,
  () => applyWordOptions()
);

watch(
  () => [state.currentIndex, state.words[state.currentIndex]?.typed, isFocused.value, scrollY.value],
  () => afterRender()
);

onMounted(async () => {
  resetWords();
  await nextTick();
  window.addEventListener('keydown', onWindowKeyDown, true);
  hintTimer = window.setTimeout(() => {
    showStartHint.value = true;
  }, 400);
  syncOpenModal();
  modalObserver = new MutationObserver(syncOpenModal);
  modalObserver.observe(document.body, { childList: true });
  resizeObserver = new ResizeObserver(() => updateCaret());
  if (wrapRef.value) resizeObserver.observe(wrapRef.value);
  focusInput();
  afterRender();
});

onUnmounted(() => {
  chartSampler.stop();
  window.removeEventListener('keydown', onWindowKeyDown, true);
  if (hintTimer) {
    clearTimeout(hintTimer);
    hintTimer = null;
  }
  modalObserver?.disconnect();
  modalObserver = null;
  resizeObserver?.disconnect();
  resizeObserver = null;
});

defineExpose({
  focusInput,
  blurInput,
  getTypingRecord,
  getTypingChartRecord,
  typingEnd,
  resetWords
});
</script>

<template>
  <div
    class="y-en-wrap"
    :class="{ 'is-focused': isFocused, 'is-typing': state.isTyping }"
    @mousedown="onWrapMouseDown"
  >
    <Transition name="mask">
      <div
        v-if="showStartHint && !isFocused && !state.isTyping && !hasOpenModal"
        class="y-en-hint"
      >
        {{ t('click_to_start') }}
      </div>
    </Transition>
    <div ref="wrapRef" class="y-en-window">
      <div
        ref="trackRef"
        class="y-en-track"
        :style="{ transform: `translateY(-${scrollY}px)` }"
      >
        <span
          v-for="(word, index) in state.words"
          :key="`${word.text}-${index}`"
          :ref="(el) => setWordRef(index, el as HTMLElement | null)"
          class="y-en-word"
          :class="{
            'is-active': index === state.currentIndex,
            'is-error': word.submitted && word.typed !== word.text
          }"
        >
          <span
            v-for="(letter, letterIndex) in buildEnglishLetters(word)"
            :key="letterIndex"
            class="y-en-letter"
            :class="`is-${letter.status}`"
            >{{ letter.char }}</span
          >
        </span>
        <i class="y-en-caret" :style="caretStyle"></i>
      </div>
    </div>
    <input
      ref="inputRef"
      class="y-en-input"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      lang="en"
      inputmode="text"
      @keydown="onKeydown"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
  </div>
</template>

<style lang="scss">
.y-en-wrap {
  position: relative;
  width: 100%;
  height: 420px;
  isolation: isolate;
  cursor: text;
  // 字距只改打字区，工具栏仍跟其它模式同一套胶囊尺寸
  font-weight: 400;
  letter-spacing: 0.2px;
  &:not(.is-focused):not(.is-typing) {
    .y-en-window {
      opacity: 0.42;
      transition: opacity 0.25s $ease-out;
    }
  }
}

.y-en-window {
  // 与中文打字区同样拉到 420px，约可露出 7 行英文词
  height: 100%;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, #000 82%, transparent 100%);
}

.y-en-track {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  column-gap: 0.65em;
  row-gap: 0.5em;
  font-size: 32px;
  line-height: 1.4;
  transition: transform 0.18s $ease-out;
}

.y-en-word {
  display: inline-flex;
  align-items: stretch;
  position: relative;
  height: 1.4em;
}

.y-en-letter {
  position: relative;
  display: inline-block;
  height: 1.4em;
  line-height: 1.4;
  color: $gray-04;
  transition: color 0.08s linear;
  &.is-correct {
    color: $gray-08;
  }
  &.is-incorrect {
    color: $main-red;
  }
  &.is-extra {
    color: $main-red;
    opacity: 0.75;
  }
  &.is-missed {
    color: $gray-04;
    text-decoration: underline;
    text-decoration-color: $main-red;
    text-underline-offset: 6px;
  }
}

.y-en-caret {
  position: absolute;
  width: 2px;
  border-radius: 1px;
  background: $main-color;
  pointer-events: none;
  animation: en-caret 1s step-end infinite;
}

.y-en-hint {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $main-color;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.18em;
  pointer-events: none;
}

.y-en-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  border: 0;
  padding: 0;
  cursor: text;
  color: transparent;
  caret-color: transparent;
}

@keyframes en-caret {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .y-en-caret {
    animation: none;
  }
  .y-en-track {
    transition: none;
  }
}

@media only screen and (max-width: 767px) {
  .y-en-track {
    font-size: 22px;
    column-gap: 0.5em;
    row-gap: 0.28em;
  }
}
</style>
