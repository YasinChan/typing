<script lang="ts" setup>
import { reactive } from 'vue';
import YModal from '@/components/ui/Modal.vue';

defineProps<{
  quote?: any;
}>();

const state = reactive({
  showDetail: false
});

function setShowDetail() {
  state.showDetail = true;
}

defineExpose({
  setShowDetail
});
</script>
<template>
  <YModal class-name="more-detail" :show="state.showDetail" @close="state.showDetail = false">
    <template #header>
      <h3>{{ $t('full_text') }}</h3>
    </template>
    <template #body>
      <div class="gray-06 more-detail__content">
        {{ quote.content }}
      </div>
    </template>
    <template #footer>
      <div></div>
    </template>
  </YModal>
</template>
<style lang="scss">
.more-detail {
  .y-modal__footer {
    padding: 0;
  }
}
.more-detail.y-modal__container {
  width: 800px;
  max-height: 80vh;
  overflow: auto;
  padding: 20px;
}
.more-detail__content {
  line-height: 1.8;
  font-size: 16px;
  text-align: justify;
  text-justify: inter-ideograph;
  word-break: break-all;
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-bottom: 20px;
}
</style>
