export function throttle<F extends (...args: any[]) => any>(
  fn: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeoutId: number | undefined;
  let lastCallTime = 0;

  return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
    const now = Date.now();
    if (now - lastCallTime >= wait) {
      clearTimeout(timeoutId);
      lastCallTime = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        lastCallTime = Date.now();
        fn.apply(this, args);
      }, wait - (now - lastCallTime));
    }
  };
}

const vThrottleClick = {
  beforeMount(el: HTMLElement, binding: any, vnode: any) {
    const handler = throttle(() => {
      binding.value();
    }, parseInt(binding.arg ?? '200'));

    el.addEventListener('click', handler);
    vnode.__unmountThrottleClick = () => {
      el.removeEventListener('click', handler);
    };
  },
  unmounted(vnode: any) {
    if (vnode.__unmountThrottleClick) {
      vnode.__unmountThrottleClick();
    }
  }
};

export default vThrottleClick;
