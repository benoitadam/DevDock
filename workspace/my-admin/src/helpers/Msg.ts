import { removeItem } from "./array";
import { debounce, throttle } from "./async";
import { toVoid } from "./cast";
import { isFunction, isNotNull } from "./check";
import { parse, stringify } from "./json";

export type IMsgHandler<T> = (value: T, oldValue: T) => void;
export type IMsgFilter<T> = (value: T) => boolean;

export interface IMsgSubscription {
  unsubscribe(): void;
}

export interface IMsgSubscribe<T> {
  subscribe(handler: (next: T) => void): IMsgSubscription;
}

export interface IMsgGet<T> {
  get(): T;
}

export interface IMsgSet<T> {
  set(value: T): IMsg<T>;
}

export interface IMsgReadonly<T> extends IMsgGet<T>, IMsgSubscribe<T> {
  readonly key?: string;
  readonly v: T;

  on(h: IMsgHandler<T>): () => void;
  off(h: IMsgHandler<T>): void;

  map<U>(cb: (val: T) => U): IMsgReadonly<U>;
  debounce(ms: number): IMsgReadonly<T>;
  throttle(ms: number): IMsgReadonly<T>;

  pipe(target: IMsgSet<T>): () => void;

  toPromise(filter?: IMsgFilter<T>): Promise<T>;
}

export interface IMsg<T> extends IMsgReadonly<T>, IMsgSet<T> {
  next(value: T | ((value: T) => T)): IMsg<T>;
}

const _msgs: Record<string, Msg> = (window as any).m4kMsgs || ((window as any).m4kMsgs = {});

export default class Msg<T = any> implements IMsg<T> {
  static keyPrefix = "m4k_"
  static storage = localStorage

  static from<T>(sourceOn: (target: IMsg<T>) => () => void, initValue: T): Msg<T>;
  static from<T>(sourceOn: (target: IMsg<T | undefined>) => () => void): Msg<T | undefined>;
  static from<T>(
    sourceOn: (target: IMsg<T | undefined>) => () => void,
    initValue?: T | undefined,
  ): Msg<T | undefined> {
    const target = new Msg<T | undefined>(initValue);
    target.sOn = () => sourceOn(target);
    target.sHandler = toVoid;
    return target;
  }
  
  static get<T>(key: string): Msg<T> {
    return _msgs[key]
  }

  public key?: string;

  /** Value */
  public v: T;

  /** Handlers */
  private h: IMsgHandler<T>[] = [];

  /** map and debounce */
  private sOn?: (handler: IMsgHandler<any>) => () => void;
  private sOff?: () => void;
  private sHandler?: IMsgHandler<any>;

  constructor(initValue: T, key?: string, isStored?: boolean) {
    this.v = initValue
    this.key = key
    if (key) _msgs[key] = this
    if (isStored && key) {
      const k = Msg.keyPrefix + key
      const storedJson = Msg.storage.getItem(k)
      const storedValue = storedJson ? parse(storedJson) : undefined
      this.v = storedValue !== undefined ? storedValue : initValue
      this.on((next) => Msg.storage.setItem(k, stringify(next)))
    }
  }

  get(): T {
    return this.v;
  }

  set(value: T, ignoreEqual?: boolean) {
    if (ignoreEqual || value !== this.v) {
      const old = this.v;
      this.v = value;
      this.h.forEach((h) => h(this.v, old));
    }
    return this;
  }

  next(value: T | ((value: T) => T), ignoreEqual?: boolean) {
    return this.set(isFunction(value) ? value(this.v) : value, ignoreEqual);
  }

  merge(changes: Record<string,any>&Partial<T>) {
    const prev = (this.v as any) || {}
    this.set({ ...prev, ...changes } as any)
  }

  subscribe(handler: (next: T) => void): IMsgSubscription {
    return { unsubscribe: this.on(handler) };
  }

  pipe(target: IMsgSet<T>) {
    target.set(this.v);
    return this.on((val) => target.set(val));
  }

  on(handler: IMsgHandler<T>) {
    this.h.push(handler);
    if (!this.sOff && this.sOn && this.sHandler) this.sOff = this.sOn(this.sHandler);
    return () => this.off(handler);
  }

  off(handler: IMsgHandler<T>) {
    removeItem(this.h, handler);
    if (this.sOff && this.h.length === 0) {
      this.sOff();
      if (this.sOn && this.sHandler) delete this.sOff;
    }
  }

  map<U>(cb: (value: T) => U): IMsgReadonly<U>;
  map<U>(
    cb: (value: T) => U,
    sourceHandler: (target: IMsg<U>) => IMsgHandler<any>,
  ): IMsgReadonly<U>;
  map<U>(
    cb: (value: T) => U,
    sourceHandler?: (target: IMsg<U>) => IMsgHandler<any>,
  ): IMsgReadonly<U> {
    const source = this as any;
    const target = new Msg<U>(cb(source.v));
    target.sOn = (h) => source.on(h);
    target.sHandler =
      (sourceHandler && sourceHandler(target)) || ((value: any) => target.set(value));
    return target;
  }

  /**
   * @example
   * a b c - - - d - - e - -
   * - - - - c - - - d - - e
   * @param ms 
   * @returns 
   */
  debounce(ms: number): IMsgReadonly<T> {
    return this.map(
      () => this.v,
      (target) => debounce((next) => target.set(next), ms),
    );
  }

  /**
   * @example
   * a b c d - - - - e - f g - -
   * a - c - d - - - e - f - g - (2s)
   * a - - d - - - - e - - g - - (3s)
   * a - - - d - - - e - - - g - (4s)
   * @param ms 
   * @returns 
   */
  throttle(ms: number): IMsgReadonly<T> {
    return this.map(
      () => this.v,
      (target) => throttle((next) => target.set(next), ms),
    );
  }

  toPromise(filter: IMsgFilter<T> = isNotNull) {
    return new Promise<T>((resolve) => {
      if (filter(this.v)) return resolve(this.v);
      const off = this.on((val) => {
        if (!filter(val)) return;
        off();
        resolve(val);
      });
    });
  }
}
