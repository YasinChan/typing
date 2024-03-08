type DeferredResolve<T> = (res: T) => void;
type DeferredReject = (error: any) => void;

export interface DeferredPromise<T> extends Promise<T> {
  resolve: DeferredResolve<T>;
  reject: DeferredReject;
}

/**
 * @description 构造一个 deferred 对象 相当于一个 resolve reject 外置的 promise 可以预先生成这个 promise 然后等待这个 promise 被外部 resolve
 */
export const getDeferred = (): DeferredPromise<any | void> => {
  let resolve: DeferredResolve<any | void> = () => {};
  let reject: DeferredReject = () => {};

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  }) as DeferredPromise<any | void>;

  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
};

export const userProfileDeferred = getDeferred();
