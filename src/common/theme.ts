import YStorage from '@/common/YStorage';
import { DARK_THEME, LIGHT_THEME, type ThemeType } from '@/config/theme';

const theme: any = {
  [DARK_THEME]: () => import('@/assets/theme/theme-dark.css'),
  [LIGHT_THEME]: () => import('@/assets/theme/theme-light.css')
};

const cacheTheme: any = {};

export function setTheme(type: ThemeType) {
  for (let i in theme) {
    // 先把渲染过的 theme style 都存一下
    if (getThemeLink(i)) {
      cacheTheme[i] = getThemeLink(i)?.cloneNode(true);
    }
  }
  if (type === getTheme()) {
    return;
  }
  return new Promise<void>((resolve, reject) => {
    if (type) {
      YStorage.set('Y_STORAGE', {
        theme: type
      });
    } else {
      type = getTheme();
      if (type) {
        YStorage.set('Y_STORAGE', {
          theme: type
        });
      } else {
        type = 'dark';
      }
    }

    // 删光光
    removeThemeLinks();
    if (cacheTheme[type as string]) {
      // 存过的直接把 DOM 塞到 head 里
      appendThemeLinkToHead(cacheTheme[type as string]);
    } else {
      // 没存过的懒加载一下
      theme[type]().then(() => {
        cacheTheme[type as string] = getThemeLink(type)?.cloneNode(true);
      });
    }
    resolve();
  });
}

export function getTheme(): ThemeType {
  return YStorage.get('Y_STORAGE')?.theme || 'dark';
}

function getThemeLink(type: string = ''): HTMLLinkElement | null {
  return document.querySelector(`link[href*="assets/theme-${type}"]`);
}

function appendThemeLinkToHead(theme: { cloneNode: (arg0: boolean) => any }) {
  return document.head.appendChild(theme.cloneNode(true));
}

function removeThemeLinks() {
  const links = document.querySelectorAll(`link[href*="assets/theme-"]`);
  links.forEach((link) => {
    link.remove();
  });
}
