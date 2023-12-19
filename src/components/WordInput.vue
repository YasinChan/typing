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
  isTyping: false
});

onMounted(async () => {
  await nextTick();
  if (!inputAreaRef.value) return;
  inputAreaRef.value.focus();
});

watch(
  () => props.quote,
  (val) => {
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
        y.value = 0;
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

function focusInput() {
  if (!inputAreaRef.value) return;
  inputAreaRef.value.focus();
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
}
function inputEvent(e: Event) {
  emit('is-typing');
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
