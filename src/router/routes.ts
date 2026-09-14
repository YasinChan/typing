export default [
  {
    path: '/',
    name: 'TimeLimit',
    component: () => import('@/view/TimeLimit.vue'),
    meta: {
      title: '限时打字模式（15/30/60/120 秒）- Typing',
      description:
        '设置 15/30/60/120 秒倒计时，专注限时打字训练。实时统计准确率与速度（WPM），支持中英文、自定义主题与字体。'
    }
  },
  {
    path: '/words',
    name: 'WordsLimit',
    component: () => import('@/view/WordsLimit.vue'),
    meta: {
      title: '英文打字（公版文学词流）- Typing',
      description:
        '用 Pride and Prejudice、Alice in Wonderland 等公版英文文稿练习打字，空格确认单词，可选练习标点，实时统计 WPM 与准确率。'
    }
  },
  {
    path: '/quote',
    name: 'QuoteLimit',
    component: () => import('@/view/QuoteLimit.vue'),
    meta: {
      title: '计时打字模式（短句 / 长句 / 引言）- Typing',
      description:
        '不限时长的计时打字练习，从短句到长句、文学引言，按完成时间统计 WPM 与准确率，支持回放与排行榜。'
    }
  },
  {
    path: '/keyboard',
    name: 'TypingKeyboard',
    component: () => import('@/view/TypingKeyboard.vue'),
    meta: {
      title: '键盘按键测试 - Typing',
      description:
        '在线键盘按键测试，实时显示按键按下与抬起状态，支持 mac/win 键位适配，可用于验证机械键盘按键是否正常。'
    }
  },
  {
    path: '/custom',
    name: 'Custom',
    component: () => import('@/view/CustomPage.vue'),
    meta: {
      title: '自定义文本打字 - Typing',
      description:
        '粘贴或上传任意文本进行打字练习，可切换标点转空格模式，记录准确率与速度。'
    }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/view/User.vue'),
    meta: { title: '个人主页 - Typing', noindex: true }
  },
  {
    path: '/log',
    name: 'Log',
    component: () => import('@/view/Log.vue'),
    meta: {
      title: '更新日志 - Typing',
      description: 'Typing 打字练习网站的功能更新与版本日志。'
    }
  },
  {
    path: '/statement',
    name: 'statement',
    component: () => import('@/view/StatementLog.vue'),
    meta: {
      title: '声明 - Typing',
      description: 'Typing 网站的使用声明、数据说明与免责条款。'
    }
  },
  {
    path: '/leaderboard',
    name: 'LeaderBoard',
    component: () => import('@/view/LeaderBoard.vue'),
    meta: {
      title: '打字速度排行榜 - Typing',
      description:
        '查看 Typing 用户的打字速度（WPM）排行榜，按限时模式与计时模式分类排名。'
    }
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/view/Game.vue'),
    meta: {
      title: '比一比 - 多人在线打字 PK - Typing',
      description:
        '创建房间或加入好友房间，进行实时多人打字 PK，比拼速度与准确率。'
    }
  },
  {
    path: '/game/:id',
    name: 'GameRoom',
    component: () => import('@/view/GameRoom.vue'),
    meta: { title: '比一比房间 - Typing', noindex: true }
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
];
