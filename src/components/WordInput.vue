<script setup lang="ts">
import { ref, onMounted, reactive, nextTick, watch } from 'vue';
import { KEY_CODE_ENUM } from '@/config/key';

type SentenceArrItem = {
  id: number;
  word: string;
  isInput: boolean;
  isWrong: boolean;
};

const whiteList = ['”']; // 白名单
const inputAreaRef = ref<HTMLElement | null>(null);
const props = defineProps<{
  sentence: string;
}>();

const state = reactive({
  isComposing: false,
  inputText: '',
  sentenceArr: [] as SentenceArrItem[]
});

onMounted(async () => {
  await nextTick();
  if (!inputAreaRef.value) return;
  inputAreaRef.value.focus();
});

watch(
  () => props.sentence,
  (val) => {
    state.inputText = '';
    if (inputAreaRef.value) {
      inputAreaRef.value.innerHTML = '';
      inputAreaRef.value.focus();
    }
    state.sentenceArr = val.split('').map((item, index) => {
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
    const inputTextArr = newVal.split('');
    state.sentenceArr.forEach((item, index) => {
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
    console.log('----------', 'state.sentenceArr', state.sentenceArr, '----------cyy log');
  }
);

function handlerInput(text: string) {
  console.log('----------', 'text', text, '----------cyy log');
  state.inputText = text;
}

function pasteEvent(e: ClipboardEvent) {
  e.preventDefault();
}
function keyDownEvent(e: KeyboardEvent) {
  if (e.code === KEY_CODE_ENUM['ENTER'] || e.code === KEY_CODE_ENUM['SPACE']) {
    e.preventDefault();
  }
}
function inputEvent(e: Event) {
  const input = e.target as HTMLElement;
  if (!state.isComposing) {
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
</script>

<template>
  <div class="y-word-input">
    <div class="y-word-input__sentence">
      <span
        v-for="item in state.sentenceArr"
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
      @compositionstart="compositionStartEvent"
      @compositionupdate="compositionUpdateEvent"
      @compositionend="compositionEndEvent"
      class="y-word-input__input-area"
      contenteditable="true"
    ></div>
  </div>
</template>

<style lang="scss">
.y-word-input {
  position: relative;
  user-select: none;
}
.y-word-input__sentence {
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
</style>
