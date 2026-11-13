<template>
  <div class="y-main y-doc-page">
    <div class="y-page-head">
      <div>
        <h1 class="y-page-title">在线打字练习与打字速度测试指南</h1>
        <p class="y-page-desc">模式选择、WPM 计算、练习方法和常见问题</p>
      </div>
    </div>
    <article class="y-doc">
      <div class="y-doc__markdown">
        <p>
          Typing 是一个免费的在线打字练习与打字速度测试网站，支持中文、英文、键盘按键测试和多人打字
          PK。你可以直接开始练习，也可以导入自己的文稿，记录每次的速度、准确率和进步曲线。
        </p>

        <h2>四种模式怎么选</h2>
        <ul>
          <li>
            <strong>限时模式</strong>：在 15 / 30 / 60 / 120 秒内尽可能多地输入，适合快速热身和冲击
            WPM。也可以在设置里使用自定义倒计时。<router-link to="/">开始限时练习</router-link>
          </li>
          <li>
            <strong>计时模式</strong
            >：不限总时长，从短句到长文完成一篇后统计用时、速度和准确率，适合完整文章练习。<router-link
              to="/quote"
              >开始计时练习</router-link
            >
          </li>
          <li>
            <strong>英文打字</strong
            >：使用公版英文文学词流练习英文输入，空格确认单词，可选标点练习。<router-link
              to="/words"
              >练习英文打字</router-link
            >
          </li>
          <li>
            <strong>键盘测试</strong
            >：实时显示按键的按下和抬起状态，用来检查键盘是否有失灵、连击或键位问题。<router-link
              to="/keyboard"
              >打开键盘测试</router-link
            >
          </li>
        </ul>

        <h2>WPM 是怎么计算的</h2>
        <p>
          常见的英文打字速度单位是 <strong>WPM（Words Per Minute，每分钟单词数）</strong>。通常按
          “正确字符数 ÷ 5 ÷ 用时分钟数”估算，五个字符折算为一个单词。中文练习同样会折算字符量，
          所以不同网站、不同文本的 WPM 不能直接横向对比。
        </p>
        <p>
          比速度更值得先关注的是准确率。错误率较高时，盲目追求 WPM
          往往会让成绩波动更大；先把准确率稳定在 95% 以上，再逐步提高速度，通常更有效。
        </p>

        <h2>中文打字速度多少算正常</h2>
        <p>
          打字速度受输入法、文本难度、标点数量和个人熟练度影响很大，没有一个统一的“正常值”。
          如果你刚开始练习，可以先记录自己的基线，再以每周的稳定提升为目标；和排行榜上的高手比较有意义，
          但不必把单次成绩当成绝对水平。
        </p>

        <h2>本机文稿与排行榜</h2>
        <p>
          限时和计时模式支持选择预设文稿，也可以导入自己的
          <code>.txt</code> 文稿。本机文稿只保存在当前浏览器， 单篇最多 888
          字，支持多篇管理、拖拽排序、编辑和批量导出，不会随账号同步。
        </p>
        <p>
          为了保证排行榜公平，本机文稿练习不计入排行榜，也不会参与成绩对比；预设文稿的练习成绩才会进入对应榜单。
          如果只是想练自己的材料，本机文稿会更合适。
        </p>

        <h2>多人在线打字 PK</h2>
        <p>
          在<router-link to="/game">比一比</router-link
          >里可以创建房间或加入好友房间，实时查看双方进度， 倒计时结束后比较速度和准确率。房间 ID
          和在线信息属于临时数据，不参与搜索收录。
        </p>

        <h2>常见问题</h2>
        <h3>需要登录才能练习吗？</h3>
        <p>
          基础打字练习、键盘测试和加入已有房间不需要登录；创建比一比房间和部分个人数据功能需要登录。
        </p>

        <h3>成绩会自动保存吗？</h3>
        <p>登录后的成绩会进入个人记录和排行榜；本机文稿练习只在本机使用，不计入排行榜。</p>

        <h3>为什么刷新后本机文稿还在，但当前选择回到预设？</h3>
        <p>
          本机文稿保存在当前浏览器的 IndexedDB
          里，刷新不会丢失；为避免本机练习无意覆盖公共成绩，页面默认回到预设文稿，点「本机」即可继续使用。
        </p>

        <h3>可以导入英文文稿吗？</h3>
        <p>
          目前本机文稿主要面向中文限时 / 计时练习。英文模式使用独立的公版词流，以保证英文 WPM
          统计和标点规则一致。
        </p>

        <p>
          准备好后可以从<router-link to="/">限时打字</router-link>或<router-link to="/quote"
            >计时打字</router-link
          >开始， 也可以先看看<router-link to="/leaderboard">打字速度排行榜</router-link
          >了解当前水平。
        </p>
      </div>
    </article>
  </div>
</template>

<style lang="scss">
.y-doc-page {
  .y-page-title {
    font-size: 24px;
  }
  .y-doc__markdown h3 {
    margin: 24px 0 8px;
    padding: 0;
    background: transparent;
    color: $gray-08;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.6;
    letter-spacing: 0;
  }
  .y-doc__markdown p + h3 {
    margin-top: 24px;
  }
}
</style>
