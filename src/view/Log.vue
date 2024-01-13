<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import MarkdownIt from 'markdown-it';

// apis
import { getTodo } from '@/request';

const state = reactive({
  markdown: ''
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
});
</script>
<template>
  <div class="log">
    <div class="log__content gray-08" v-html="state.markdown"></div>
  </div>
</template>
<style lang="scss">
.log {
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
