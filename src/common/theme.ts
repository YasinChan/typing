import YStorage from '@/common/YStorage';

type themeType = 'dark' | 'light';

function getCurrentThemeLink(): HTMLLinkElement | null {
  return document.querySelector(`link[href*="assets/theme-"]`);
}

export function setTheme(type?: themeType | undefined) {
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
    import('@/assets/theme/theme-light.scss');
  } else {
    import('@/assets/theme/theme-dark.scss');
  }
}

export function getTheme(): themeType | undefined {
  return YStorage.get('Y_STORAGE')?.theme;
}
