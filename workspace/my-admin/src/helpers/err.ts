export class Err extends Error {
  error: any;
  args: any[];
  [key: string]: any;

  constructor(...args: any[]) {
    super('');
    this.name = 'Err';
    this.args = args;

    const sb = [];
    for (const e of args) {
      if (e instanceof Error) {
        this.error = e;
        this.name = e.name;
        for (const p of Object.getOwnPropertyNames(e)) {
          this[p] = (e as any)[p];
        }
        break;
      } else if (typeof e === "string") {
        sb.push(e);
      } else if (typeof e === "number") {
        sb.push(e);
      } else if (typeof e === "object") {
        for (const p in e) {
          this[p] = (e as any)[p];
        }
      }
    }
    this.message = sb.join(' ');
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

export const toErr = (...args: any[]) => args[0] instanceof Err ? args[0] : new Err(...args);

export const throwErr = (...args: any[]) => {
  throw toErr(...args);
}

type Fun = (...args: any[]) => any;

interface Catcher {
  <F extends Fun>(fun: F): (...args: Parameters<F>) => ReturnType<F> | undefined;
  <F extends Fun, T>(fun: F, errHandler: T|((e: Err) => T)): (...args: Parameters<F>) => ReturnType<F> | T;
}

export const catcher: Catcher = <T, F extends Fun>(fun: F, errHandler?: (e: Err) => T) => (
  (...args: Parameters<F>): ReturnType<F> | T | undefined => {
    try {
      return fun(...args);
    } catch (error) {
      return typeof errHandler === 'function' ? errHandler(toErr(error)) : errHandler;
    }
  }
);
