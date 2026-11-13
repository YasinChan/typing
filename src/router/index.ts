import { ref } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import routes from '@/router/routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
});

// 路由组件是异步加载的。加载期间先占住 main 的高度，避免页脚先被顶上来。
export const routeLoading = ref(true);
const ROUTE_LOADING_MIN_MS = 180;
let routeLoadingStartedAt = Date.now();
let routeLoadingTimer: number | null = null;

function startRouteLoading() {
  if (routeLoadingTimer !== null) {
    window.clearTimeout(routeLoadingTimer);
    routeLoadingTimer = null;
  }
  routeLoadingStartedAt = Date.now();
  routeLoading.value = true;
}

function finishRouteLoading() {
  if (routeLoadingTimer !== null) {
    window.clearTimeout(routeLoadingTimer);
  }
  const elapsed = Date.now() - routeLoadingStartedAt;
  routeLoadingTimer = window.setTimeout(() => {
    routeLoading.value = false;
    routeLoadingTimer = null;
  }, Math.max(0, ROUTE_LOADING_MIN_MS - elapsed));
}

router.beforeEach((to, from) => {
  // query/hash 变化不换页面，不闪 loading
  if (from.name === to.name && from.path === to.path) return;
  startRouteLoading();
});

const DEFAULT_TITLE = '在线打字练习与打字速度测试（WPM）| 键盘测试 / 多人 PK - Typing';
const DEFAULT_DESCRIPTION =
  '免费的在线中英文打字练习与打字速度测试（WPM）网站。提供限时、计时、英文、键盘测试与多人 PK 模式，实时统计准确率与速度，支持回放、排行榜、自定义主题与字体。';
const SITE_URL = 'https://typing.yasinchan.com';

function setMetaDescription(content: string) {
  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

function setMetaRobots(noindex: boolean) {
  let el = document.querySelector('meta[name="robots"]');
  if (noindex) {
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      document.head.appendChild(el);
    }
    el.setAttribute('content', 'noindex, nofollow');
  } else if (el) {
    el.parentNode?.removeChild(el);
  }
}

router.afterEach((to) => {
  const title = (to.meta?.title as string | undefined) || DEFAULT_TITLE;
  const description = (to.meta?.description as string | undefined) || DEFAULT_DESCRIPTION;
  const path = to.path === '/' ? '/' : to.path.replace(/\/+$/, '');
  const canonicalUrl = `${SITE_URL}${path}`;

  document.title = title;
  setMetaDescription(description);
  setCanonical(canonicalUrl);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMetaRobots(Boolean(to.meta?.noindex));
  finishRouteLoading();
});

router.onError(() => {
  finishRouteLoading();
});

export default router;
