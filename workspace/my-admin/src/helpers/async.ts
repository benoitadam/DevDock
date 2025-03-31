import { toErr } from "./err";


export const retry = async <T>(createPromise: () => Promise<T>, retry = 2): Promise<T> => {
  let error: any;
  for (let i = 0; i < retry; i++) {
    try {
      return await createPromise();
    } catch (e) {
      error = e;
    }
  }
  throw error;
};

export const withTimeout = <T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(toErr('timeout')), timeoutMs);
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(t));
  });
};


export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
* @example
* a b c - - - d - - e - -
* - - - - c - - - d - - e
*/
export const debounce = <A = unknown>(fn: (value: A) => unknown, ms: number) => {
  let timer: any, lastValue: A;
  const update = () => {
    timer = null;
    fn(lastValue);
  };
  return (value: A) => {
    lastValue = value;
    if (timer) clearTimeout(timer);
    timer = setTimeout(update, ms);
  };
};

/**
* @example
* a b c d - - - - e - f g - -
* a - c - d - - - e - f - g - (2s)
* a - - d - - - - e - - g - - (3s)
* a - - - d - - - e - - - g - (4s)
*/
export const throttle = <A = unknown>(fn: (value: A) => unknown, ms: number) => {
  let lastTime = 0,
    lastValue: A,
    timer: any;
  const update = () => {
    timer = null;
    fn(lastValue);
    lastTime = Date.now();
  };
  return (value: A) => {
    lastValue = value;
    if (timer) clearTimeout(timer);
    const nextCall = Math.max(ms - (Date.now() - lastTime), 0);
    if (nextCall === 0) update();
    else timer = setTimeout(update, nextCall);
  };
};

