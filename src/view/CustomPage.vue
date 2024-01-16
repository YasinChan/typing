<script setup lang="ts">
import { reactive, nextTick, ref, watch, onUnmounted, computed } from 'vue';
import type { TypingRecordType } from '@/types';

// components
import WordInput from '@/components/WordInput.vue';
import DetailModal from '@/components/DetailModal.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import YModal from '@/components/ui/Modal.vue';
import YTextarea from '@/components/ui/Textarea.vue';
import YButton from '@/components/ui/Button.vue';
import ResultContent from '@/components/ResultContent.vue';

// stores
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';

// files
import Sentence from '@/files/Quote.json';

// svg
import IcoChange from '@/assets/svg/change.svg';
import IcoUpload from '@/assets/svg/upload.svg';

const wordInputRef = ref<any>(null);
const uploadFile = ref<any>(null);
const detailModalRef = ref<any>(null);
const useConfig = useConfigStore();
const { currentFont, onlyShowMain, isEscape } = storeToRefs(useConfig);

const state = reactive({
  customInfo: '',
  show: false,
  isSet: false, // 记录是否一句确认，确认后刷新按钮隐藏
  quotes: null as any,
  isTyping: false,
  intervalId: null as null | number,
  lastIndex: -1,
  type: 'medium' as 'short' | 'long' | 'medium',
  time: 0 as number,
  showTime: true,
  showResult: false,
  typingRecord: {} as TypingRecordType
});

state.quotes = getRandom();

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
  state.isTyping = false;
  state.time = 0;
  state.quotes = null;
  await nextTick();
  state.quotes = getRandom();
}

function getRandom() {
  const array = Object.values(Sentence[state.type]);

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
function isTypingFunc() {
  state.isTyping = true;
}
function finished() {
  state.isTyping = false;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.showResult = true;
  state.typingRecord = wordInputRef.value?.getTypingRecord();
}

function restart() {
  state.isTyping = false;
  state.time = 0;
  state.showResult = false;
}

function customClick() {
  state.show = true;
  nextTick(() => {
    state.customInfo = state.quotes?.content;
  });
}

function confirmSet() {
  state.quotes = { content: state.customInfo.replace(/[\r\n]+/g, '。').replace(/\s+/g, '，') };
  state.show = false;
  state.isSet = true;
}
function handleFileChange(event: any) {
  const selectedFile = event.target.files[0];
  if (selectedFile && ['text/plain'].includes(selectedFile.type)) {
    const file = selectedFile;

    // 预览文本文件前 1000 个字符
    if (['text/plain'].includes(selectedFile.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        state.customInfo = reader.result?.slice(0, 1000) as string;
      };
      if (file) {
        reader.readAsText(file);
      }
    }
  } else {
    alert('请选择支持的文件类型!');
  }
}
function uploadFileFunc() {
  if (uploadFile.value) {
    uploadFile.value.click();
  }
}
</script>
<template>
  <main :class="'y-font--' + currentFont" class="y-custom-page">
    <template v-if="!state.showResult">
      <div class="y-custom-page__setting-wrap">
        <div
          v-if="state.showTime"
          class="y-custom-page__start"
          :class="[timeFormat ? 'y-custom-page__start--active' : '']"
        >
          {{ timeFormat || 0 }}
        </div>
        <div class="y-custom-page__setting">
          <Transition name="menu">
            <div
              v-show="!onlyShowMain"
              class="y-custom-page__setting-item y-custom-page__set-time"
              :class="[state.showTime ? 'y-custom-page__time--active' : '']"
              @click="state.showTime = !state.showTime"
            >
              显示计时
            </div>
          </Transition>
          <Transition name="menu">
            <div
              v-show="!onlyShowMain"
              v-if="!state.isSet"
              class="y-custom-page__setting-item y-custom-page__refresh"
              @click="refresh"
            >
              <Tooltip class="y-custom-page__time-svg" content="刷新">
                <IcoChange></IcoChange>
              </Tooltip>
            </div>
          </Transition>
          <Transition name="menu">
            <div
              v-show="!onlyShowMain"
              class="y-custom-page__setting-item y-custom-page__custom"
              @click="customClick"
            >
              自定义
            </div>
          </Transition>
        </div>
      </div>
      <WordInput
        ref="wordInputRef"
        v-if="state.quotes"
        :quote="state.quotes?.content"
        @is-typing="isTypingFunc"
        @is-finished="finished"
        class-name="y-custom-page__word-input"
      ></WordInput>
      <DetailModal ref="detailModalRef" :quote="state.quotes"></DetailModal>
      <Transition name="menu">
        <div v-show="!onlyShowMain" class="y-custom-page__tips">
          <p>*键入过程中，按下键盘左上角 Esc 键可随时结束输入进度。</p>
        </div>
      </Transition>
    </template>
    <template v-else>
      <ResultContent
        :typing-record="state.typingRecord"
        :show-save-record="false"
        @restart="restart"
        :total-time="state.time"
        :is-positive="true"
      ></ResultContent>
    </template>
  </main>
  <YModal
    class-name="y-custom-page__modal"
    :show="state.show"
    @close="state.show = false"
    @confirm="state.show = false"
  >
    <template #header>
      <div class="flex-center--y">
        <h3>自定义文案</h3>
        <div class="y-custom-page__modal-body-setting flex-center--y">
          <YButton size="small">
            <label class="flex-center--y" @click="uploadFileFunc" for="">
              <input ref="uploadFile" type="file" accept=".txt" @change="handleFileChange" />
              <IcoUpload></IcoUpload>
              <span>上传文档</span>
            </label>
          </YButton>
        </div>
      </div>
    </template>
    <template #body>
      <div class="y-custom-page__modal-body">
        <YTextarea v-model="state.customInfo" :max-length="888"></YTextarea>
      </div>
    </template>
    <template #footer>
      <YButton :disable="!state.customInfo?.length" size="small" @click="confirmSet">确定</YButton>
    </template>
  </YModal>
</template>
<style lang="scss">
.y-custom-page {
  .y-word-input {
    width: 100%;
  }
}
.y-custom-page__refresh {
  cursor: pointer;
}
.y-custom-page__info {
  margin-top: 30px;
  text-align: right;
  color: $gray-02;
}
.y-custom-page__setting-wrap {
  position: relative;
  overflow: hidden;
  padding-top: 50px;
  margin-top: -50px;
}
.y-custom-page__setting {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
  transition: transform 0.2s ease;
}
.y-custom-page__setting-item:not(:last-child) {
  position: relative;
  margin-right: 30px;
  &::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 12px;
    background: $gray-02;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.y-custom-page__start {
  position: absolute;
  top: 50px;
  left: 0;
  color: $gray-04;
  font-size: 22px;
  font-weight: bold;
  &.y-custom-page__start--active {
    color: $main-color;
  }
}
.y-custom-page__time-svg {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 18px;
    height: 18px;
    fill: $gray-06;
    cursor: pointer;
  }
}
.y-custom-page__set-time {
  display: inline-flex;
  align-items: center;
  color: $gray-04;
  font-size: 14px;
  line-height: 24px;
  height: 24px;
  cursor: pointer;
  &.y-custom-page__time--active {
    color: $main-color;
  }
}
.y-custom-page__custom {
  display: inline-flex;
  align-items: center;
  color: $gray-06;
  font-size: 16px;
  line-height: 24px;
  height: 24px;
  cursor: pointer;
}
.y-custom-page__word-input.y-word-input__wrap {
  height: 280px;
  .y-word-input {
    height: 280px;
  }
}
.y-custom-page__info {
  margin-top: 30px;
  text-align: right;
  color: $gray-02;
}
.y-custom-page__detail {
  text-align: right;
  color: $gray-02;
  font-size: 14px;
  font-weight: normal;
  margin-top: 20px;
  cursor: pointer;
}
.y-custom-page__tips {
  margin-top: 60px;
  color: $gray-02;
  font-size: 16px;
  line-height: 30px;
  height: 24px;
  text-align: center;
}
.y-custom-page__modal {
  width: 800px;
  height: 80vh;
  .y-modal__body {
    height: calc(80vh - 125px);
    overflow: auto;
    padding-bottom: 20px;
  }
  .y-modal__footer {
    border-top: 1px solid $gray-02;
    padding: 10px 20px;
  }
  .y-custom-page__modal-body,
  .y-textarea,
  .y-textarea textarea {
    height: 100%;
  }
}
.y-custom-page__modal-body-setting {
  color: $gray-06;
  margin-left: 20px;
  label {
    cursor: pointer;
  }
  input[type='file'] {
    display: none;
  }
  svg {
    width: 16px;
    height: 16px;
    fill: $label-white;
  }
}
</style>
