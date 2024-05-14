import YStorage from '@/common/YStorage';
import { DARK_THEME, DEFAULT_THEME, LIGHT_THEME, type ThemeType } from '@/config/theme';
import { removeAllCustomCssValue, setCustomCssValue } from '@/common/color';
import { COLOR_ENUM, type COLOR_TYPE } from '@/types';

const theme: any = {
  [DARK_THEME]: () => import('@/assets/theme/theme-dark.scss'),
  [LIGHT_THEME]: () => import('@/assets/theme/theme-light.scss')
};

const cacheTheme: any = {};

export function setTheme(type: ThemeType) {
  for (const i in theme) {
    // 先把渲染过的 theme style 都存一下
    if (getThemeLink(i)) {
      cacheTheme[i] = getThemeLink(i)?.cloneNode(true);
    }
  }
  if (type === getTheme() && type === DEFAULT_THEME) {
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

export function setCustomTheme(info?: string, obj?: COLOR_TYPE) {
  let customObj;
  if (info) {
    const reg = /%(.*?)%/;
    const is = reg.test(info);
    if (is) {
      const content = info.match(reg)?.[1];
      if (!content) return;
      customObj = JSON.parse(content);
    }
  } else {
    customObj = obj;
  }

  removeAllCustomCssValue();
  setCustomCssValue(COLOR_ENUM['LAYOUT_BACKGROUND_COLOR'], customObj['LAYOUT_BACKGROUND_COLOR']);
  setCustomCssValue(COLOR_ENUM['MAIN_COLOR'], customObj['MAIN_COLOR']);
  setCustomCssValue(COLOR_ENUM['MAIN_RED'], customObj['MAIN_RED']);
  setCustomCssValue(COLOR_ENUM['LABEL_WHITE'], customObj['LABEL_WHITE']);
  setCustomCssValue(COLOR_ENUM['BACKGROUND_COLOR'], customObj['BACKGROUND_COLOR']);
  setCustomCssValue(COLOR_ENUM['LAYOUT_BACKGROUND_COLOR'], customObj['LAYOUT_BACKGROUND_COLOR']);
  setCustomCssValue(COLOR_ENUM['GRAY_08'], customObj['GRAY_08']);
  setCustomCssValue(COLOR_ENUM['GRAY_06'], customObj['GRAY_06']);
  setCustomCssValue(COLOR_ENUM['GRAY_04'], customObj['GRAY_04']);
  setCustomCssValue(COLOR_ENUM['GRAY_02'], customObj['GRAY_02']);
}

export function getCustomTheme(ct: string) {
  const reg = /%(.*?)%/;
  const is = reg.test(ct);
  if (is) {
    const content = ct.match(reg)?.[1];
    if (!content) {
      return ct;
    }
    return JSON.parse(content);
  }
  return ct;
}
