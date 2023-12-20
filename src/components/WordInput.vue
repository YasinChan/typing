<script setup lang="ts">
import { ref, onMounted, reactive, nextTick, watch } from 'vue';
import { KEY_CODE_ENUM } from '@/config/key';
import { useScroll } from '@vueuse/core';

type SentenceArrItem = {
  id: number;
  word: string;
  isInput: boolean;
  isWrong: boolean;
};

type TypingRecordItemType = {
  cursorPosition?: number;
  word?: number | string;
  isInput?: boolean;
  isComposition?: boolean;
  isWrong?: boolean;
};
type TypingRecordType = {
  [key: number]: TypingRecordItemType[];
};

const LINE_HEIGHT = 70;
const el = ref<HTMLElement | null>(null);
const { x, y } = useScroll(el, { behavior: 'smooth' });
const whiteList = ['”', '》', '}', ']', '’']; // 白名单
const inputAreaRef = ref<HTMLElement | null>(null);
const props = defineProps<{
  quote: string;
}>();

const emit = defineEmits(['is-typing']);

const state = reactive({
  currentAreaHeight: LINE_HEIGHT,
  isComposing: false,
  inputText: '',
  quoteArr: [] as SentenceArrItem[],
  isTyping: false,
  timeout: null as null | number,
  typingRecordRealTime: [] as TypingRecordItemType[], // 记录实时输入的字符
  typingRecord: {} as TypingRecordType, // 每 100ms 记录一次 typingRecordRealTime
  currentInput: '', // 当前非 isComposing 状态输入的字符，每次这里开始记录，currentComposition 都会清空
  currentComposition: '' // 当处于 isComposing 状态时输入的字符，每次这里开始记录，currentInput 都会清空
});

onMounted(async () => {
  await nextTick();
  if (!inputAreaRef.value) return;
  inputAreaRef.value.focus();
});

watch(
  () => state.isTyping,
  (val) => {
    if (val) {
      // 开始输入
      emit('is-typing');
      // state.timeout = setTimeout(() => {
      //   // 开始记录
      //   record();
      // }, 100);
    }
  }
);

watch(
  () => props.quote,
  (val) => {
    // 传入的内容发生变化时，重置
    state.inputText = '';
    if (inputAreaRef.value) {
      inputAreaRef.value.innerHTML = '';
      inputAreaRef.value.focus();
    }
    state.quoteArr = val.split('').map((item, index) => {
      return {
        id: index,
        word: item,
        isInput: false,
        isWrong: false
      };
    });
  },
  {
    immediate: true
  }
);

watch(
  () => state.inputText,
  (newVal) => {
    if (newVal === '') {
      setTimeout(() => {
        reset();
      });
    }

    const inputTextArr = newVal.split('');
    state.quoteArr.forEach((item, index) => {
      item.isInput = false;
      item.isWrong = false;
      if (inputTextArr[index]) {
        item.isInput = true;
        item.isWrong = item.word !== inputTextArr[index];
        if (whiteList.includes(inputTextArr[index])) {
          item.isInput = item.word === inputTextArr[index];
          item.isWrong = false;
        }
      }
    });
  }
);

function record() {}

function reset() {
  state.inputText = '';
  state.isTyping = false;
  state.typingRecord = {};
  state.typingRecordRealTime = [];
}

function beforeInputEvent(e: Event) {
  state.isTyping = true;
  console.log('beforeInputEvent', e);
  console.log('2', state.isComposing);
}

function focusInput() {
  if (!inputAreaRef.value) return;
  inputAreaRef.value.focus();
  moveCaretToEnd(inputAreaRef.value);
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
  if (e.code === KEY_CODE_ENUM['ENTER'] || e.code === KEY_CODE_ENUM['SPACE']) {
    e.preventDefault();
  }
  if (
    e.shiftKey &&
    (e.code === KEY_CODE_ENUM['ARROW_LEFT'] || e.key === KEY_CODE_ENUM['ARROW_RIGHT'])
  ) {
    // shift + 左右方向键禁止
    e.preventDefault();
    console.log('Shift + 左右方向键已被禁止');
  }
}
function inputEvent(e: Event) {
  console.log('inputEvent');
  const input = e.target as HTMLElement;
  if (!state.isComposing) {
    handlerInput(input?.innerText);
  }
}
function compositionStartEvent() {
  console.log('compositionStartEvent');
  state.isComposing = true;
}
function compositionUpdateEvent() {
  state.isComposing = true;
}
function compositionEndEvent(e: CompositionEvent) {
  console.log('compositionEndEvent');
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

defineExpose({
  focusInput
});
</script>

<template>
  <div class="y-word-input__wrap">
    <Transition name="mask">
      <div v-if="y > 0" class="y-word-input__mask"></div>
    </Transition>
    <div class="y-word-input__mask-bottom"></div>
    <div class="y-word-input" ref="el">
      <div class="y-word-input__quote">
        <span
          v-for="item in state.quoteArr"
          :class="[item.isWrong ? 'is-wrong' : '', item.isInput ? 'is-input' : '']"
          :key="item.id"
          >{{ item.word }}</span
        >
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
  height: 280px;
  overflow: hidden;
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
  height: 280px;
  overflow: hidden;
}
.y-word-input__quote {
  line-height: 70px;
  user-select: none;
  color: $gray-04;
  .is-input {
    color: $gray-06;
  }
  .is-wrong {
    color: $main-red;
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
  transition: all 0.3s;
  outline: 0;
  &:after {
    content: '';
    position: absolute;
    display: block;
    width: 100%;
    height: 1px;
    bottom: 20px;
    background: $gray-06;
  }
  &:hover,
  &:focus {
    &:after {
      background: $main-color-hover;
    }
  }
}

.mask-enter-active,
.mask-leave-active {
  transition: all 0.3s ease;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}
</style>
