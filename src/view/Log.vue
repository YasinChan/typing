<script lang="ts" setup>
import { onMounted, reactive, nextTick } from 'vue';
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
  const todoRes = await getTodo();
  const todo = todoRes.data?.result;
  const md = MarkdownIt({
    html: false,
    linkify: true,
    typographer: true
  });
  state.markdown = md.render(todo.todo?.markdown);
  await nextTick();
  state.isLoading = false;
});
</script>
<template>
  <div class="y-main y-log">
    <YLoading class="y-log__loading" v-if="state.isLoading"></YLoading>
    <div class="log__content gray-08" v-html="state.markdown"></div>
  </div>
</template>
<style lang="scss">
.y-log__loading {
  position: fixed;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}
.y-log {
  width: 880px;
  margin: 50px auto;
  line-height: 1.4;
  h2 {
    margin: 30px 0 20px;
  }
  h3 {
    margin-bottom: 10px;
    color: $gray-06;
  }
  ul {
    margin-bottom: 20px;
    color: $gray-04;
  }
  li {
    margin-left: 20px;
    padding-bottom: 10px;
  }
  a {
    text-decoration: underline;
    color: $gray-06;
  }
}
</style>
