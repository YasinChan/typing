<template>
  <div class="y-main y-doc-page">
    <div class="y-page-head">
      <div>
        <h1 class="y-page-title">页面不存在</h1>
        <p class="y-page-desc">这个地址可能已经失效，或者输入有误。</p>
      </div>
    </div>
    <article class="y-doc y-not-found">
      <p>可以回到首页继续练习，或者从下面的入口重新开始。</p>
      <div class="y-not-found__links">
        <router-link to="/">限时打字</router-link>
        <router-link to="/quote">计时打字</router-link>
        <router-link to="/words">英文打字</router-link>
        <router-link to="/keyboard">键盘测试</router-link>
        <router-link to="/leaderboard">排行榜</router-link>
      </div>
    </article>
  </div>
</template>

<style lang="scss">
.y-not-found {
  color: $gray-06;
  font-size: 15px;
  line-height: 1.8;
}
.y-not-found__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 18px;
  a {
    color: $accent-text;
    text-decoration: underline;
    text-underline-offset: 3px;
    &:hover {
      color: $gray-08;
    }
  }
}
</style>
