<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import MarkdownIt from 'markdown-it';

// components
import YLoading from '@/components/ui/Loading.vue';

// apis
import { getTodo } from '@/request';

const state = reactive({
  markdown: '',
  isLoading: true
});

onMounted(async () => {
  try {
    const todoRes = await getTodo();
    const markdown = todoRes.data?.result?.todo?.markdown || '';
    const md = MarkdownIt({
      html: false,
      linkify: true,
      typographer: true
    });
    // 页面已有「更新日志」标题，去掉 markdown 里重复的一级章节
    state.markdown = md.render(markdown.replace(/^##\s*更新日志\s*\n+/, ''));
  } catch (error) {
    state.markdown = '<p>日志加载失败，请稍后重试。</p>';
  } finally {
    state.isLoading = false;
  }
});
</script>
<template>
  <div class="y-main y-doc-page">
    <div class="y-page-head">
      <div>
        <h1 class="y-page-title">更新日志</h1>
        <p class="y-page-desc">功能更新与版本记录</p>
      </div>
    </div>
    <article class="y-doc">
      <YLoading class="y-doc__loading" v-if="state.isLoading"></YLoading>
      <div v-else class="y-doc__markdown" v-html="state.markdown"></div>
    </article>
  </div>
</template>
