<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import MarkdownIt from 'markdown-it';

const state = reactive({
  markdown: ''
});

onMounted(async () => {
  const todo = `## 叠甲
1. 本个人网站的所有资源均来源于互联网公开资源或本人原创。对于非原创作品，本站已尽可能地标注了原始作者或版权所有者的相关信息，并力求遵循合理使用的法律原则。
2. 若您是任何被引用资源的版权所有者，发现本站存在未经授权使用或引用的情况，请通过电子邮件（867103198@qq.com）与本站取得联系，本站将尽快核实并按照您的要求进行删除、替换或正确署名。
3. 对于您自行上传的全部文案内容（如自定义模式中上传的内容），本站不拥有所有权，也不承担任何法律责任。您理解并同意，由您上传的内容所引发的一切争议、损失或损害，均与本站无关。
4. 本站保留在任何时候对您上传至服务器的内容（如昵称等）进行修改、移动或删除的权利，无需事先通知。这些操作可能基于但不限于以下原因：内容涉嫌违法、侵权、违规，或者为了保持网站正常运行和维护服务质量。
5. 隐私方面，注册登录仅用于记录和统计输入速度，您完全可以不用注册而使用所有功能。您注册的密码也已进行单向 Hash 加密（[bcrypt](https://github.com/dcodeIO/bcrypt.js#readme)），不可反向破解生成密码明文，意思是本站也无法知道具体密码内容。
6. 本站仅学习交流使用，无任何商业用途。
7. 最终解释权归本站所有。

## 素材来源
- icon-font 来源 [iconfont.cn](https://www.iconfont.cn/)
- 字体 来源 [free-font](https://wordshub.github.io/free-font/) [Google Fonts](https://fonts.google.com/)
- 词句来源互联网

## 参考
- 模式参考
  - https://monkeytype.com
  - https://dazi.kukuw.com
  - https://barneyzhao.gitee.io/typing-cn
  - https://typetest.io/
  - https://typings.gg/
- 键盘相关知识
  - https://zhuanlan.zhihu.com/p/397003447
  - https://www.zfrontier.com/app/flow/4okzKBndN774

## 源码
[https://github.com/YasinChan/typing](https://github.com/YasinChan/typing)

## 备案
[苏ICP备18046434号](https://beian.miit.gov.cn/)`;
  const md = MarkdownIt({
    html: false,
    linkify: true,
    typographer: true
  });
  state.markdown = md.render(todo);
});
</script>
<template>
  <div class="statement">
    <h1>声明</h1>
    <div class="log__content gray-08" v-html="state.markdown"></div>
  </div>
</template>
<style lang="scss">
.statement {
  color: $gray-08;
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
