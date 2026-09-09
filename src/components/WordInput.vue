<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, unref, watch } from 'vue';
import { KEY_CODE_ENUM } from '@/config/key';
import { useScroll } from '@vueuse/core';
import {
  type IWebsocketTypingInfo,
  type SentenceArrItem,
  type TypingRecordItemType,
  type TypingRecordType
} from '@/types';
import { useI18n } from 'vue-i18n';

// common
import { replacePunctuationWithSpace } from '@/common/string';

// composables
import { useTypingChartSampler } from '@/composables/use-typing-chart-sampler';
import { useProgressInfo } from '@/composables/use-progress-info';

const LINE_HEIGHT = 70;
const el = ref<HTMLElement | null>(null);
const { y } = useScroll(el, { behavior: 'smooth' });
const whiteList = ['”', '》', '}', '）', '】', '’']; // 白名单，这些字符不会被标记为错误
const compositionList = ['“”', '《》', '{}', '（）', '【】', '‘’']; // composition 状态下的字符
const inputAreaRef = ref<HTMLElement | null>(null);
const isFocused = ref(false);
const showStartHint = ref(false);
let hintTimer: number | null = null;
const hasOpenModal = ref(false);
let modalObserver: MutationObserver | null = null;
const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    quote: string;
    showMask?: boolean;
    className?: string;
    isSpaceType?: boolean; // 是否是空格模式，指需要将标点符号都转为空格
    canSpace?: boolean;
    isShowProgress?: boolean; // 是否展示进度，配合比一比游戏，展示其他人的进度。
    progressInfo?: IWebsocketTypingInfo;
  }>(),
  {
    showMask: true,
    isSpaceType: false,
    canSpace: false,
    isShowProgress: false
  }
);

const emit = defineEmits(['is-typing', 'keydown-event', 'is-finished', 'typingInfo']);

interface ITypingFinalWordsRecord {
  [key: string]: string | number;
}

const state = reactive({
  currentAreaHeight: LINE_HEIGHT,
  isComposing: false,
  inputText: '',
  content: '',
  quoteLength: 0,
  quoteArr: [] as SentenceArrItem[],
  isTyping: false,
  timeout: null as null | number,
  startTime: 0,
  typingRecordRealTime: [] as TypingRecordItemType[], // 记录实时输入的字符
  typingRecord: {} as TypingRecordType, // 每 100ms 记录一次 typingRecordRealTime
  wrongLength: 0,
  wordLength: 0,
  currentComposition: '' // 当处于 isComposing 状态时输入的字符
});

const chartSampler = useTypingChartSampler({
  wordLength: () => state.wordLength,
  wrongLength: () => state.wrongLength
});

onMounted(async () => {
  await nextTick();
  window.addEventListener('keydown', onWindowKeyDown, true);
  // 等页面自动聚焦完成后再决定是否展示提示，避免首屏闪一下
  hintTimer = window.setTimeout(() => {
    showStartHint.value = true;
  }, 400);
  syncOpenModal();
  modalObserver = new MutationObserver(syncOpenModal);
  modalObserver.observe(document.body, { childList: true });
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
});

const { grouped: progressInfoComputed, keys: progressInfoKeys } = useProgressInfo(
  computed(() => props.progressInfo)
);

watch(
  () => {
    return {
      value: state.currentComposition,
      isComposing: state.isComposing
    };
  },
  (val, oldVal) => {
    if (val.value !== oldVal.value && val.value === '') {
      // 这里是在 composition 状态下删除了最后一个字符时会触发的，此时需要将 composition 状态下的输入删除
      state.typingRecordRealTime = state.typingRecordRealTime.filter((item) => {
        return !item.isComposition;
      });
      return;
    }
    if (val.isComposing && val.isComposing !== oldVal.isComposing) {
      // 从非 composition 切换到 composition
      if (state.typingRecordRealTime.length) {
        const position = getCursorPosition();
        const word = state.typingRecordRealTime[0].word;
        const wrongPos = state.typingRecordRealTime[0].wrongPos;
        if (word && position && word.length > position) {
          // 此时表示光标左移过
          const part1 = word.substring(0, position);
          const part2 = word.substring(position);
          let part1WrongPos: number[] = [];
          let part2WrongPos: number[] = [];
          if (wrongPos) {
            // 这里是处理如果光标左移过的情况下 isInput 被分割成下面两块，此时其中的 wrongPos 需要重新计算
            part1WrongPos = wrongPos.filter((item) => {
              return item < position;
            });
            wrongPos.forEach((item) => {
              if (item >= position) {
                part2WrongPos = [...part2WrongPos, item - position];
              }
            });
          }
          state.typingRecordRealTime = [
            {
              word: part1,
              isInput: true,
              wrongPos: part1WrongPos.length ? part1WrongPos : undefined
            },
            {
              word: '',
              isComposition: true
            },
            {
              word: part2,
              isInput: true,
              wrongPos: part2WrongPos.length ? part2WrongPos : undefined
            }
          ];
        } else {
          // 光标没有左移则直接将输入的字符添加到 typingRecordRealTime 后面
          state.typingRecordRealTime.push({
            word: unref(val.value),
            isComposition: true
          });
        }
      } else {
        // 当 typingRecordRealTime 为空时，直接将输入的字符添加到 typingRecordRealTime 中
        state.typingRecordRealTime = [
          {
            word: unref(val.value),
            isComposition: true
          }
        ];
      }
      return;
    }
    if (val.isComposing && val.isComposing === oldVal.isComposing) {
      // composition 状态
      if (state.typingRecordRealTime.length && state.typingRecordRealTime[1]) {
        // 当 typingRecordRealTime 长度大于 1 时，将 composition 状态下的输入添加到 typingRecordRealTime 的第二个元素中
        // 根据上面的逻辑，第二个元素一定是 composition 状态下的输入
        state.typingRecordRealTime[1] = {
          word: unref(val.value),
          isComposition: true
        };
      } else {
        // 当 typingRecordRealTime 长度小于 1 时，将 composition 状态下的输入添加到 typingRecordRealTime 的第一个元素中
        // 同理，第一个元素一定是 composition 状态下的输入
        state.typingRecordRealTime[0] = {
          word: unref(val.value),
          isComposition: true
        };
      }
      return;
    }
    if (!val.isComposing && val.isComposing !== oldVal.isComposing) {
      // 从 composition 切换到非 composition
      return;
    }
    if (!val.isComposing && val.isComposing === oldVal.isComposing) {
      // 非 composition 状态
      return;
    }
  }
);

watch(
  () => state.typingRecordRealTime,
  () => {
    if (!state.startTime) {
      return;
    }
    const relativeTime = new Date().getTime() - state.startTime;
    state.typingRecord[Math.floor(relativeTime / 100)] = state.typingRecordRealTime.map((item) => ({
      ...item,
      wrongPos: item.wrongPos ? [...item.wrongPos] : item.wrongPos
    }));
  },
  {
    deep: true
  }
);

watch(
  () => state.isTyping,
  (val) => {
    if (val) {
      // 开始输入
      emit('is-typing');
      state.startTime = new Date().getTime();
      chartSampler.start();
    } else {
      state.startTime = 0;
    }
  }
);

watch(
  () => props.quote,
  (val) => {
    // 传入的内容发生变化时，重置
    state.content = val;
  },
  {
    immediate: true
  }
);

watch(
  () => state.content,
  (val) => {
    if (props.isSpaceType) {
      state.content = replacePunctuationWithSpace(val);
    }
    state.quoteLength = val.length || 0;
    setTimeout(() => {
      reset();
    });
    if (inputAreaRef.value) {
      inputAreaRef.value.innerHTML = '';
      // inputAreaRef.value.focus();
    }
    state.quoteArr = val.split('').map((item, index) => {
      return {
        id: index,
        word: item,
        isInput: false,
        isWrong: false,
        info: null
      };
    });
  },
  {
    immediate: true
  }
);

watch(
  () => props.isSpaceType,
  (val) => {
    if (val) {
      state.content = replacePunctuationWithSpace(state.content);
    } else {
      state.content = props.quote;
    }
  },
  {
    immediate: true
  }
);

watch(
  () => state.inputText,
  (newVal) => {
    const inputTextArr = newVal.split('');
    const wrongPos: number[] = [];
    state.quoteArr.forEach((item, index) => {
      item.isInput = false;
      item.isWrong = false;
      if (inputTextArr[index]) {
        item.isInput = true;
        item.isWrong = item.word !== inputTextArr[index];
        if (item.isWrong) {
          wrongPos.push(index);
        }
        if (whiteList.includes(inputTextArr[index])) {
          item.isInput = item.word === inputTextArr[index];
          item.isWrong = false;
        }
      }
    });
    const wrongLength = wrongPos.length;
    const wordLength = inputTextArr.length;
    state.wrongLength = wrongLength;
    state.wordLength = wordLength;
    const accuracy =
      wordLength === 0 ? '0%' : (((wordLength - wrongLength) / wordLength) * 100).toFixed(0) + '%';
    emit('typingInfo', {
      wordLength,
      wrongLength,
      accuracy
    });

    state.typingRecordRealTime = [
      {
        word: newVal,
        isInput: true,
        wrongPos
      }
    ];
    setTimeout(() => {
      if (newVal.length >= state.quoteLength) {
        // 输入完成
        emit('is-finished');
      }
    });
  }
);

function typingEnd() {
  // 用这个组件的地方结束的时候要通过这里通知里面结束了。
  chartSampler.stop();
}

function reset() {
  state.inputText = '';
  state.isTyping = false;
  state.typingRecord = {};
  state.typingRecordRealTime = [];
}

function beforeInputEvent(e: any) {
  state.isTyping = true;
  if (e.inputType === 'insertCompositionText') {
    if (compositionList.includes(e.data)) {
      return;
    }
    // 处于 composition 状态
    if (state.currentComposition === e.data || !/\w+/.test(e.data)) {
      // 这里是 composition 状态结束的条件，比如按了空格、回车。
      state.isComposing = false;
      state.currentComposition = '';
      return;
    }
    state.currentComposition = e.data;
    return;
  }

  if (e.inputType === 'deleteContentBackward') {
    if (state.currentComposition) {
      // 如果在 composition 状态下鼠标点了旁边，这时 composition 状态下的输入会被删除，此时只需要将 currentComposition 清空即可。
      state.currentComposition = '';
      return;
    }
    return;
  }
}

const selection = window.getSelection();
function getCursorPosition() {
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const offset = range.startOffset;

    // 直接返回光标所在的偏移量
    return offset;
  } else {
    return null; // 没有光标位置
  }
}

function focusInput() {
  if (!inputAreaRef.value) return;
  inputAreaRef.value.focus();
  moveCaretToEnd(inputAreaRef.value);
  isFocused.value = true;
}
function blurInput() {
  if (!inputAreaRef.value) return;
  inputAreaRef.value.blur();
}

function syncOpenModal() {
  hasOpenModal.value = !!document.querySelector('.y-modal__mask');
}

/** 点击文案区域时把光标拉回输入层，避免点到上层字母却无法继续打 */
function onWrapMouseDown(e: MouseEvent) {
  if (hasOpenModal.value) return;
  const target = e.target as HTMLElement | null;
  if (target?.closest('.y-word-input__input-area')) {
    return;
  }
  e.preventDefault();
  focusInput();
}

/** 弹窗未打开时，任意可输入按键重新聚焦，避免点到空白后键盘失灵 */
function onWindowKeyDown(e: KeyboardEvent) {
  if (state.isComposing) return;
  if (document.querySelector('.y-modal__mask')) return;
  const target = e.target as HTMLElement | null;
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.code === 'Escape' || e.code === 'Tab' || e.code === 'Enter') return;
  if (e.key.length === 1 || e.code === 'Space' || e.code === 'Backspace') {
    // 只拉回焦点，拦截这次按键，避免英文字母直接写入、IME 进不了 composition
    e.preventDefault();
    focusInput();
  }
}

function moveCaretToEnd(element: HTMLElement) {
  // 使光标移动到末尾
  if (document.createRange && window.getSelection) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection && selection.removeAllRanges();
    selection && selection.addRange(range);
    // @ts-ignore
  } else if (document.body.createTextRange) {
    // For older IE
    // @ts-ignore
    const range = document.body.createTextRange();
    range.moveToElementText(element);
    range.collapse(false);
    range.select();
  }
}

function handlerInput(text: string) {
  state.inputText = text;
  const currentHeight = inputAreaRef.value?.offsetHeight;
  if (currentHeight && currentHeight > Math.max(state.currentAreaHeight, LINE_HEIGHT * 2)) {
    y.value += LINE_HEIGHT;
  } else if (currentHeight && currentHeight < state.currentAreaHeight) {
    y.value -= LINE_HEIGHT;
  }
  state.currentAreaHeight = currentHeight || LINE_HEIGHT;
}

function pasteEvent(e: ClipboardEvent) {
  e.preventDefault();
}
function keyDownEvent(e: KeyboardEvent) {
  emit('keydown-event', e);
  if (e.code === KEY_CODE_ENUM['ENTER']) {
    e.preventDefault();
  }
  if (!props.isSpaceType && !props.canSpace && e.code === KEY_CODE_ENUM['SPACE']) {
    e.preventDefault();
  }
  if (
    e.shiftKey &&
    (e.code === KEY_CODE_ENUM['ARROW_LEFT'] || e.key === KEY_CODE_ENUM['ARROW_RIGHT'])
  ) {
    // shift + 左右方向键禁止
    e.preventDefault();
  }
  if ((e.metaKey || e.ctrlKey) && e.code === KEY_CODE_ENUM['KEY_A']) {
    // ctrl + a 禁止 或者 command + a 禁止
    e.preventDefault();
  }
  if ((e.metaKey || e.ctrlKey) && e.code === KEY_CODE_ENUM['KEY_Z']) {
    // ctrl + z 禁止 或者 command + z 禁止
    e.preventDefault();
  }
  if ((e.metaKey || e.ctrlKey) && e.code === KEY_CODE_ENUM['BACKSPACE']) {
    // ctrl + back space 禁止 或者 command + back space 禁止
    e.preventDefault();
  }
}
function inputEvent(e: Event) {
  const input = e.target as HTMLElement;
  if (!state.isComposing) {
    if (input.innerText.trim() === '') {
      input.innerHTML = '';
    }
    handlerInput(input?.innerText);
  }
}
function compositionStartEvent() {
  state.isComposing = true;
}
function compositionUpdateEvent() {
  state.isComposing = true;
}
function compositionEndEvent(e: CompositionEvent) {
  state.isComposing = false;
  const input = e.target as HTMLElement;
  const text = input?.innerText;
  if (text.length !== state.inputText.length) {
    handlerInput(text);
  }
}

function mouseDownEvent() {
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

function shortenString(str: string) {
  // 如果字符串长度小于等于3，则不需要截断，直接返回原字符串
  if (str.length <= 3) {
    return str;
  }

  const firstChar = str.charAt(0);
  const lastChar = str.charAt(str.length - 1);

  return firstChar + '…' + lastChar;
}

defineExpose({
  focusInput,
  blurInput,
  getTypingRecord,
  getTypingChartRecord,
  typingEnd
});
</script>

<template>
  <div
    class="y-word-input__wrap"
    :class="[className, { 'is-focused': isFocused, 'is-typing': state.isTyping }]"
    @mousedown="onWrapMouseDown"
  >
    <Transition name="mask">
      <div v-if="y > 0" class="y-word-input__mask"></div>
    </Transition>
    <div class="y-word-input__mask-bottom" v-if="showMask"></div>
    <Transition name="mask">
      <div
        v-if="showStartHint && !isFocused && !state.isTyping && !hasOpenModal"
        class="y-word-input__hint"
      >
        {{ t('click_to_start') }}
      </div>
    </Transition>
    <div class="y-word-input" ref="el">
      <div class="y-word-input__quote">
        <span
          v-for="(item, index) in state.quoteArr"
          :class="[
            'letter',
            item.isWrong ? 'is-wrong' : '',
            item.isInput ? 'is-input' : '',
          ]"
          :key="item.id"
          >{{ item.word
          }}<template v-if="progressInfoKeys.includes(index)"
            ><span
              class="y-word-input__typing-info"
              v-for="i in progressInfoComputed[index]"
              :style="{
                color: i.color
              }"
              :key="i.name"
              >{{ shortenString(i.name) }} : {{ i.accuracy }}</span
            ></template
          >
        </span>
      </div>
      <div
        ref="inputAreaRef"
        @paste="pasteEvent"
        @keydown="keyDownEvent"
        @input="inputEvent"
        @mousedown.prevent="mouseDownEvent"
        @mouseup.prevent
        @beforeinput="beforeInputEvent"
        @compositionstart="compositionStartEvent"
        @compositionupdate="compositionUpdateEvent"
        @compositionend="compositionEndEvent"
        @focus="isFocused = true"
        @blur="isFocused = false"
        class="y-word-input__input-area"
        contenteditable="true"
      ></div>
    </div>
  </div>
</template>

<style lang="scss">
.y-word-input__wrap {
  position: relative;
  width: 100%;
  min-height: 150px;
  overflow: hidden;
  cursor: text;
  /* 把 hint 的 z-index 限制在打字区内，避免盖住 Teleport 到 body 的弹框 */
  isolation: isolate;
  &:not(.is-focused):not(.is-typing) {
    .y-word-input__quote,
    .y-word-input__input-area {
      opacity: 0.42;
      transition: opacity 0.25s $ease-out;
    }
  }
}

.y-word-input__mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(
    to bottom,
    $background-gray 0%,
    $background-gray 10%,
    rgba(255, 0, 0, 0) 100%
  );
  z-index: 1;
}
.y-word-input__mask-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  pointer-events: none;
  background: linear-gradient(
    to top,
    $background-gray 0%,
    $background-gray 10%,
    rgba(255, 0, 0, 0) 100%
  );
  z-index: 1;
}

.y-word-input {
  position: absolute;
  top: -10px;
  user-select: none;
  min-height: 150px;
  overflow: hidden;
}
.y-word-input__quote {
  line-height: 70px;
  user-select: none;
  color: $gray-04;
  word-break: break-all;
  white-space: normal;
  .letter {
    position: relative;
    transition: color 0.08s linear;
  }
  .is-input {
    color: $gray-08;
  }
  .is-wrong {
    color: $main-red;
    text-decoration: underline;
    text-underline-offset: 6px;
  }
}
.y-word-input__input-area {
  position: absolute;
  user-select: none;
  top: 30px;
  line-height: 70px;
  display: inline-block;
  width: 100%;
  color: $gray-08;
  caret-color: $main-color;
  transition: opacity 0.25s $ease-out;
  outline: 0;
  &:after {
    content: '';
    position: absolute;
    display: block;
    width: 100%;
    height: 2px;
    bottom: 18px;
    border-radius: 2px;
    background: $gray-02;
    opacity: 0.7;
    transition: background-color 0.2s $ease-out, opacity 0.2s $ease-out;
  }
  &:hover,
  &:focus {
    &:after {
      background: $main-color;
      opacity: 1;
    }
  }
}

.y-word-input__hint {
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

.mask-enter-active,
.mask-leave-active {
  transition: all 0.3s ease;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}
.y-word-input__typing-info {
  position: absolute;
  top: -17px;
  line-height: 20px;
  font-size: 12px;
  white-space: nowrap;
  height: 20px;
  display: block;
  left: 0;
  opacity: 0.4;
  color: $gray-06;
  &:after {
    position: absolute;
    content: '';
    width: 1px;
    //background: $gray-08;
    border-left: 1px solid;
    height: 38px;
    left: 0;
    top: 0;
    animation: blink 1s infinite;
  }
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
