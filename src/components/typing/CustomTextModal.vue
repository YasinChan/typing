<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import dayjs from 'dayjs';
import YModal from '@/components/ui/Modal.vue';
import YInput from '@/components/ui/Input.vue';
import YTextarea from '@/components/ui/Textarea.vue';
import YButton from '@/components/ui/Button.vue';
import YLoading from '@/components/ui/Loading.vue';
import IcoTips from '@/assets/svg/tips.svg';
import IcoUpload from '@/assets/svg/upload.svg';
import Sentence from '@/files/Quote.json';
import {
  listCustomTexts,
  createCustomText,
  updateCustomText,
  deleteCustomText,
  reorderCustomTexts,
  type CustomTextRecord
} from '@/common/custom-text-db';
import {
  CUSTOM_TEXT_MAX_LENGTH,
  downloadCustomText,
  normalizeCustomText
} from '@/common/custom-text';
import type { PresetQuote } from '@/types';
import { downloadZip } from '@/common/zip';

type SourceTab = 'preset' | 'local';
type LengthKey = 'short' | 'medium' | 'long';
type FilterKey = 'all' | LengthKey;

const props = withDefaults(
  defineProps<{
    show: boolean;
    initialTab?: SourceTab;
    activeLocalId?: string;
    activePresetTitle?: string;
    allowedPresetLengths?: LengthKey[];
  }>(),
  {
    initialTab: 'preset',
    activeLocalId: '',
    activePresetTitle: '',
    allowedPresetLengths: () => ['short', 'medium', 'long']
  }
);

const emit = defineEmits<{
  'update:show': [value: boolean];
  selectPreset: [quote: PresetQuote];
  selectLocal: [record: CustomTextRecord];
  localUpdated: [record: CustomTextRecord];
  localDeleted: [id: string];
}>();

const message: any = inject('message');
const confirm: any = inject('confirm');
const tab = ref<SourceTab>('preset');
const presetFilter = ref<FilterKey>('all');
const localList = ref<CustomTextRecord[]>([]);
const loading = ref(false);
const view = ref<'list' | 'edit'>('list');
const editingId = ref('');
const draftName = ref('');
const draftText = ref('');
const uploadInput = ref<HTMLInputElement | null>(null);
const selectedIds = ref<string[]>([]);
const draggingId = ref('');
const dragOverId = ref('');

const lengthLabels: Record<LengthKey, string> = {
  short: '短句',
  medium: '中句',
  long: '长句'
};

const allowedLengths = computed<LengthKey[]>(() =>
  props.allowedPresetLengths?.length ? props.allowedPresetLengths : ['short', 'medium', 'long']
);

const presets = computed<PresetQuote[]>(() =>
  allowedLengths.value.flatMap((length) =>
    ((Sentence as any)[length] || []).map((quote: any, index: number) => ({
      key: `${length}-${index}`,
      title: quote.title || '未命名文稿',
      author: quote.author || '佚名',
      type: quote.type || '文稿',
      length,
      content: quote.content || ''
    }))
  )
);

const filters = computed(() => [
  { key: 'all' as FilterKey, label: '全部', count: presets.value.length },
  ...allowedLengths.value.map((length) => ({
    key: length as FilterKey,
    label: lengthLabels[length],
    count: presets.value.filter((quote) => quote.length === length).length
  }))
]);

const filteredPresets = computed(() =>
  presetFilter.value === 'all'
    ? presets.value
    : presets.value.filter((quote) => quote.length === presetFilter.value)
);

const draftLength = computed(() => draftText.value.length);
const allSelected = computed(
  () =>
    localList.value.length > 0 &&
    localList.value.every((record) => selectedIds.value.includes(record.id))
);

watch(
  () => props.show,
  (show) => {
    if (!show) return;
    tab.value = props.initialTab;
    presetFilter.value = 'all';
    view.value = 'list';
    selectedIds.value = [];
    draggingId.value = '';
    dragOverId.value = '';
    loadLocalList();
  }
);

watch(tab, (value) => {
  if (value === 'local' && !localList.value.length && !loading.value) {
    loadLocalList();
  }
});

async function loadLocalList() {
  loading.value = true;
  try {
    localList.value = await listCustomTexts();
  } catch (error) {
    console.error('load custom texts failed', error);
    message({ message: '本机文稿读取失败，请稍后重试', type: 'error' });
  } finally {
    const existingIds = new Set(localList.value.map((record) => record.id));
    selectedIds.value = selectedIds.value.filter((id) => existingIds.has(id));
    loading.value = false;
  }
}

function toggleSelect(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id];
}

function toggleSelectAll() {
  selectedIds.value = allSelected.value ? [] : localList.value.map((record) => record.id);
}

function exportSelected() {
  const records = localList.value.filter((record) => selectedIds.value.includes(record.id));
  if (!records.length) {
    message({ message: '请先勾选要导出的文稿', type: 'error' });
    return;
  }
  downloadZip(records.map((record) => ({ name: record.name, content: record.content })));
  message({ message: `已导出 ${records.length} 篇文稿为 zip`, timeout: 3500 });
}

function startDrag(record: CustomTextRecord, event: DragEvent) {
  draggingId.value = record.id;
  dragOverId.value = '';
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', record.id);
  }
}

function onDragOver(id: string) {
  if (!draggingId.value || draggingId.value === id) return;
  dragOverId.value = id;
}

function endDrag() {
  draggingId.value = '';
  dragOverId.value = '';
}

function onDrop(target: CustomTextRecord) {
  const sourceId = draggingId.value;
  endDrag();
  if (!sourceId || sourceId === target.id) return;
  const fromIndex = localList.value.findIndex((record) => record.id === sourceId);
  const toIndex = localList.value.findIndex((record) => record.id === target.id);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = localList.value.splice(fromIndex, 1);
  localList.value.splice(toIndex, 0, moved);
  void persistOrder();
}

async function persistOrder() {
  try {
    await reorderCustomTexts(localList.value);
  } catch (error) {
    console.error('reorder custom texts failed', error);
    message({ message: '顺序保存失败，已重新加载列表', type: 'error' });
    await loadLocalList();
  }
}

function close() {
  emit('update:show', false);
}

function formatDate(timestamp: number) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
}

function selectPreset(quote: PresetQuote) {
  emit('selectPreset', quote);
  close();
}

function selectLocal(record: CustomTextRecord) {
  emit('selectLocal', record);
  close();
}

function openEditor(record?: CustomTextRecord) {
  view.value = 'edit';
  editingId.value = record?.id || '';
  draftName.value = record?.name || `本机文稿 ${localList.value.length + 1}`;
  draftText.value = record?.content || '';
}

function backToList() {
  view.value = 'list';
}

async function saveEditor() {
  const content = normalizeCustomText(draftText.value);
  if (!content) {
    message({ message: '请输入文稿内容', type: 'error' });
    return;
  }
  const name = (draftName.value.trim() || `本机文稿 ${localList.value.length + 1}`).slice(0, 30);

  try {
    if (editingId.value) {
      const current = localList.value.find((record) => record.id === editingId.value);
      if (!current) {
        message({ message: '文稿不存在，请刷新后重试', type: 'error' });
        return;
      }
      const updated = await updateCustomText({ ...current, name, content });
      emit('localUpdated', updated);
      message({ message: '文稿已更新' });
    } else {
      const record = await createCustomText(name, content);
      message({ message: '文稿已保存到本机' });
      emit('localUpdated', record);
    }
    await loadLocalList();
    view.value = 'list';
  } catch (error) {
    console.error('save custom text failed', error);
    message({ message: '保存失败，请重试', type: 'error' });
  }
}

function deleteRecord(record: CustomTextRecord) {
  confirm({
    title: '删除本机文稿',
    content: `将删除「${record.name}」，不会影响预设文稿，也不会影响其他账号数据。`,
    ok: '删除',
    cancel: '取消',
    confirm: async () => {
      try {
        await deleteCustomText(record.id);
        localList.value = localList.value.filter((item) => item.id !== record.id);
        selectedIds.value = selectedIds.value.filter((id) => id !== record.id);
        emit('localDeleted', record.id);
        message({ message: '已删除本机文稿' });
      } catch (error) {
        console.error('delete custom text failed', error);
        message({ message: '删除失败，请稍后重试', type: 'error' });
      }
      return true;
    }
  });
}

function exportRecord(record: CustomTextRecord) {
  downloadCustomText(record.content, record.name);
  message({ message: '已导出 txt 备份' });
}

function uploadFileFunc() {
  uploadInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  input.value = '';
  if (!files.length) return;

  const validFiles = files.filter(
    (file) => file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')
  );
  if (!validFiles.length) {
    message({ message: '请选择 .txt 文本文件', type: 'error' });
    return;
  }

  loading.value = true;
  let created = 0;
  let truncated = 0;
  try {
    for (const file of validFiles) {
      const text = await readFile(file);
      const content = normalizeCustomText(text);
      if (!content) continue;
      if (text.length > CUSTOM_TEXT_MAX_LENGTH) truncated += 1;
      const name = (
        file.name.replace(/\.txt$/i, '').trim() ||
        `本机文稿 ${localList.value.length + created + 1}`
      ).slice(0, 30);
      await createCustomText(name, content);
      created += 1;
    }
    await loadLocalList();
    const truncateTip = truncated ? `，${truncated} 篇超过 ${CUSTOM_TEXT_MAX_LENGTH} 字已截断` : '';
    message({
      message: `已保存 ${created} 篇本机文稿${truncateTip}`,
      timeout: 4500
    });
  } catch (error) {
    console.error('upload custom texts failed', error);
    message({ message: '上传失败，请稍后重试', type: 'error' });
  } finally {
    const existingIds = new Set(localList.value.map((record) => record.id));
    selectedIds.value = selectedIds.value.filter((id) => existingIds.has(id));
    loading.value = false;
  }
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'utf-8');
  });
}
</script>

<template>
  <YModal class-name="y-source-modal" :show="show" @close="close" @confirm="close">
    <template #header>
      <div class="y-source-modal__head">
        <h3>选择文稿</h3>
        <div class="y-source-modal__tabs">
          <button
            type="button"
            class="y-source-modal__tab"
            :class="{ 'is-active': tab === 'preset' }"
            @click="tab = 'preset'"
          >
            预设文稿
            <span>{{ presets.length }}</span>
          </button>
          <button
            type="button"
            class="y-source-modal__tab"
            :class="{ 'is-active': tab === 'local' }"
            @click="tab = 'local'"
          >
            本机文稿
            <span>{{ localList.length }}</span>
          </button>
        </div>
      </div>
    </template>

    <template #body>
      <div class="y-source-modal__body">
        <template v-if="tab === 'preset'">
          <div v-if="allowedLengths.length > 1" class="y-source-modal__filters">
            <button
              v-for="filter in filters"
              :key="filter.key"
              type="button"
              class="y-source-modal__filter"
              :class="{ 'is-active': presetFilter === filter.key }"
              @click="presetFilter = filter.key"
            >
              {{ filter.label }}
              <span>{{ filter.count }}</span>
            </button>
          </div>
          <div class="y-source-modal__list">
            <button
              v-for="quote in filteredPresets"
              :key="quote.key"
              type="button"
              class="y-source-modal__preset"
              :class="{ 'is-active': activePresetTitle === quote.title }"
              @click="selectPreset(quote)"
            >
              <span class="y-source-modal__preset-top">
                <span class="y-source-modal__preset-title">{{ quote.title }}</span>
                <span class="y-source-modal__preset-badge">{{ lengthLabels[quote.length] }}</span>
              </span>
              <span class="y-source-modal__preset-meta">
                {{ quote.author }} · {{ quote.type }} · {{ quote.content.length }} 字
              </span>
              <span class="y-source-modal__preset-preview">
                {{ quote.content.slice(0, 96) }}{{ quote.content.length > 96 ? '…' : '' }}
              </span>
            </button>
          </div>
        </template>

        <template v-else>
          <div v-if="view === 'list'" class="y-source-modal__local-view">
            <div class="y-source-modal__local-top">
              <div class="y-source-modal__notice">
                <IcoTips></IcoTips>
                <div>
                  <strong>仅保存在当前浏览器</strong>
                  <p>
                    不会上传服务器，也不会随账号同步。最多 {{ CUSTOM_TEXT_MAX_LENGTH }}
                    字 / 篇，支持拖拽排序、导入多篇 .txt、勾选后批量导出 zip。
                  </p>
                </div>
              </div>
              <div class="y-source-modal__actions">
                <YButton size="small" @click="openEditor()">新建文稿</YButton>
                <YButton size="small" theme="secondary" @click="uploadFileFunc">
                  <IcoUpload></IcoUpload>
                  上传 txt（可多选）
                </YButton>
                <input
                  ref="uploadInput"
                  type="file"
                  accept=".txt,text/plain"
                  multiple
                  @change="handleFileChange"
                />
              </div>
              <div v-if="localList.length && !loading" class="y-source-modal__batch">
                <label class="y-source-modal__select-all" @click.stop>
                  <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
                  全选
                </label>
                <span class="y-source-modal__selected-count">
                  {{ selectedIds.length ? `已选 ${selectedIds.length} 篇` : '勾选后可批量导出' }}
                </span>
                <YButton
                  size="small"
                  theme="secondary"
                  :disable="!selectedIds.length"
                  @click="exportSelected"
                >
                  导出选中{{ selectedIds.length ? ` (${selectedIds.length})` : '' }}
                </YButton>
              </div>
            </div>

            <YLoading v-if="loading" class="y-source-modal__loading"></YLoading>
            <div v-else-if="!localList.length" class="y-source-modal__empty">
              <div>还没有本机文稿</div>
              <p>可以新建一篇，或一次导入多个 .txt 文件。文稿只保存在当前浏览器。</p>
              <YButton size="small" @click="openEditor()">新建第一篇</YButton>
            </div>
            <div v-else class="y-source-modal__local-list">
              <div
                v-for="record in localList"
                :key="record.id"
                class="y-source-modal__local-item"
                :class="{
                  'is-active': activeLocalId === record.id,
                  'is-dragging': draggingId === record.id,
                  'is-drop-target':
                    dragOverId === record.id && !!draggingId && draggingId !== record.id
                }"
                @click="selectLocal(record)"
                @dragover.prevent="onDragOver(record.id)"
                @drop.prevent="onDrop(record)"
              >
                <span
                  class="y-source-modal__drag-handle"
                  draggable="true"
                  title="拖动排序"
                  aria-label="拖动排序"
                  @click.stop
                  @dragstart.stop="startDrag(record, $event)"
                  @dragend="endDrag"
                >
                  ⋮⋮
                </span>
                <label class="y-source-modal__check" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(record.id)"
                    @change="toggleSelect(record.id)"
                  />
                </label>
                <div class="y-source-modal__local-main">
                  <div class="y-source-modal__local-title">
                    {{ record.name }}
                    <span v-if="activeLocalId === record.id">使用中</span>
                  </div>
                  <div class="y-source-modal__local-meta">
                    {{ record.content.length }} 字 · 更新于 {{ formatDate(record.updatedAt) }}
                  </div>
                  <div class="y-source-modal__local-preview">
                    {{ record.content.slice(0, 80) }}{{ record.content.length > 80 ? '…' : '' }}
                  </div>
                </div>
                <div class="y-source-modal__local-actions" @click.stop>
                  <button type="button" class="is-primary" @click="selectLocal(record)">
                    使用
                  </button>
                  <button type="button" @click="openEditor(record)">编辑</button>
                  <button type="button" @click="exportRecord(record)">导出</button>
                  <button type="button" @click="deleteRecord(record)">删除</button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="y-source-modal__editor">
            <div class="y-source-modal__editor-head">
              <button type="button" @click="backToList">← 返回列表</button>
              <span>{{ editingId ? '编辑文稿' : '新建文稿' }}</span>
            </div>
            <YInput
              v-model="draftName"
              :max-length="30"
              placeholder="文稿名称，最多 30 字"
            ></YInput>
            <YTextarea
              v-model="draftText"
              :max-length="CUSTOM_TEXT_MAX_LENGTH"
              placeholder="粘贴或输入文稿内容"
            ></YTextarea>
            <div class="y-source-modal__editor-meta">
              最多 {{ CUSTOM_TEXT_MAX_LENGTH }} 字 · 当前 {{ draftLength }} 字
            </div>
            <div class="y-source-modal__editor-actions">
              <YButton size="small" theme="secondary" @click="backToList">取消</YButton>
              <YButton :disable="!draftText.trim()" size="small" @click="saveEditor">保存</YButton>
            </div>
          </div>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="y-source-modal__footer">
        <span>预设文稿来自站内精选；本机文稿只保存在当前浏览器</span>
        <YButton size="small" theme="secondary" @click="close">关闭</YButton>
      </div>
    </template>
  </YModal>
</template>

<style lang="scss">
.y-source-modal {
  width: min(880px, calc(100vw - 40px));
  height: 82vh;
  .y-modal__body {
    height: calc(82vh - 125px);
    overflow: hidden;
    padding: 0 24px 20px;
  }
  .y-modal__footer {
    border-top: 1px solid $gray-02;
    padding: 10px 20px;
  }
}
.y-source-modal__head {
  display: flex;
  align-items: center;
  gap: 20px;
  h3 {
    margin: 0;
    white-space: nowrap;
  }
}
.y-source-modal__tabs {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: $radius-full;
  background: $background-gray;
}
.y-source-modal__tab {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: $radius-full;
  background: transparent;
  color: $gray-06;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s $ease-out, background-color 0.2s $ease-out, box-shadow 0.2s $ease-out;
  span {
    margin-left: 4px;
    color: $gray-06;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  &:hover {
    color: $gray-08;
  }
  &.is-active {
    background: $layout-background-gray;
    color: $gray-08;
    box-shadow: $shadow-sm;
    span {
      color: $accent-text;
    }
  }
}
.y-source-modal__body {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.y-source-modal__filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 12px 0;
}
.y-source-modal__filter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border: 0;
  border-radius: $radius-full;
  background: transparent;
  color: $gray-06;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.2s $ease-out, background-color 0.2s $ease-out;
  span {
    font-size: 11px;
    color: $gray-06;
    font-variant-numeric: tabular-nums;
  }
  &:hover {
    color: $gray-08;
    background: $background-gray;
  }
  &.is-active {
    color: $accent-text;
    background: $accent-soft;
    span {
      color: $accent-text;
    }
  }
}
.y-source-modal__list,
.y-source-modal__local-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
  overscroll-behavior: contain;
}
.y-source-modal__preset {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid $border-hairline;
  border-radius: $radius-md;
  background: transparent;
  color: $gray-08;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s $ease-out, border-color 0.2s $ease-out;
  &:hover {
    background: $background-gray;
  }
  &.is-active {
    border-color: $accent-text;
    background: $accent-soft;
  }
}
.y-source-modal__preset-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.y-source-modal__preset-title {
  font-size: 14px;
  font-weight: 500;
}
.y-source-modal__preset-badge {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: $radius-full;
  background: $background-gray;
  color: $gray-06;
  font-size: 11px;
  font-weight: 400;
}
.y-source-modal__preset-meta {
  color: $gray-06;
  font-size: 12px;
}
.y-source-modal__preset-preview {
  overflow: hidden;
  color: $gray-06;
  font-size: 12px;
  line-height: 1.6;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.y-source-modal__local-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}
.y-source-modal__local-top {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.y-source-modal__notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: $background-gray;
  border: 1px solid $border-hairline;
  border-radius: $radius-md;
  color: $gray-06;
  font-size: 12px;
  line-height: 1.7;
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 2px;
    fill: $accent-text;
  }
  strong {
    display: block;
    margin-bottom: 2px;
    color: $gray-08;
    font-size: 13px;
    font-weight: 600;
  }
  p {
    margin: 0;
  }
}
.y-source-modal__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  input[type='file'] {
    display: none;
  }
  svg {
    width: 14px;
    height: 14px;
    margin-right: 2px;
    fill: currentColor;
  }
}
.y-source-modal__loading {
  margin: 40px auto;
}
.y-source-modal__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 220px;
  color: $gray-06;
  font-size: 14px;
  text-align: center;
  p {
    max-width: 420px;
    font-size: 12px;
    line-height: 1.7;
  }
}
.y-source-modal__batch {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border: 1px solid $border-hairline;
  border-radius: $radius-md;
  background: $background-gray;
}
.y-source-modal__select-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: $gray-08;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  input,
  .y-source-modal__check input {
    width: 14px;
    height: 14px;
    accent-color: $accent-text;
    cursor: pointer;
  }
}
.y-source-modal__selected-count {
  flex: 1;
  color: $gray-06;
  font-size: 12px;
}
.y-source-modal__drag-handle {
  flex-shrink: 0;
  width: 18px;
  color: $gray-06;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -3px;
  line-height: 1;
  text-align: center;
  cursor: grab;
  user-select: none;
  transition: color 0.2s $ease-out;
  &:hover {
    color: $accent-text;
  }
  &:active {
    cursor: grabbing;
  }
}
.y-source-modal__check {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  input {
    width: 14px;
    height: 14px;
    accent-color: $accent-text;
    cursor: pointer;
  }
}
.y-source-modal__local-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid $border-hairline;
  border-radius: $radius-md;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s $ease-out, border-color 0.2s $ease-out, opacity 0.2s $ease-out;
  &:hover {
    background: $background-gray;
  }
  &.is-active {
    border-color: $accent-text;
    background: $accent-soft;
  }
  &.is-dragging {
    opacity: 0.45;
  }
  &.is-drop-target {
    border-color: $accent-text;
    box-shadow: inset 0 2px 0 $accent-text;
  }
}
.y-source-modal__local-main {
  min-width: 0;
  flex: 1;
}
.y-source-modal__local-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  span {
    flex-shrink: 0;
    padding: 1px 6px;
    border-radius: $radius-full;
    background: $accent-text;
    color: $accent-ink;
    font-size: 10px;
    font-weight: 500;
  }
}
.y-source-modal__local-meta {
  margin-top: 3px;
  color: $gray-06;
  font-size: 12px;
}
.y-source-modal__local-preview {
  margin-top: 3px;
  overflow: hidden;
  color: $gray-06;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.y-source-modal__local-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  button {
    padding: 4px 6px;
    border: 0;
    border-radius: $radius-sm;
    background: transparent;
    color: $gray-06;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    &:hover {
      color: $accent-text;
      background: $background-gray;
    }
    &.is-primary {
      color: $accent-text;
    }
  }
}
.y-source-modal__editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
  .y-textarea {
    flex: 1;
    min-height: 0;
    height: auto;
  }
  .y-textarea textarea {
    height: 100%;
  }
}
.y-source-modal__editor-head {
  display: flex;
  align-items: center;
  gap: 10px;
  color: $gray-08;
  font-size: 14px;
  font-weight: 500;
  button {
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: $gray-06;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    &:hover {
      color: $accent-text;
    }
  }
}
.y-source-modal__editor-meta {
  color: $gray-06;
  font-size: 12px;
}
.y-source-modal__editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.y-source-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: $gray-06;
  font-size: 12px;
}
</style>
