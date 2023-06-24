import YStorage from '@/common/YStorage';

type themeType = 'dark' | 'light';

function getCurrentThemeLink(): HTMLLinkElement {
  return document.querySelector(`[href*="theme/color"]`);
}

export function setTheme(type: themeType | undefined) {
  getCurrentThemeLink()?.remove();
  if (type) {
    YStorage.set('Y_STORAGE', {
      theme: type
    });
  } else {
    type = getTheme();
    if (!type) {
      YStorage.set('Y_STORAGE', {
        theme: type
      });
    }
  }
  if (type === 'light') {
    import(/* webpackChunkName: "theme/color/light" */ '@/assets/theme/color/light.scss');
  } else {
    import(/* webpackChunkName: "theme/color/dark" */ '@/assets/theme/color/dark.scss');
  }
}

export function getTheme(): themeType {
  return YStorage.get('Y_STORAGE').theme;
}
