import { uniq } from "./array";
import { isArray, isObject } from "./check";

export const merge = <T extends {}>(target: T, changes: Partial<T>): T => {
    const keys = Object.keys(changes);
    for (const key of keys) {
      const v = (changes as any)[key];
      if (v === undefined) {
        delete (target as any)[key];
        continue;
      }
      (target as any)[key] = merge((target as any)[key], v);
    }
    return target;
  };

export const sortKey = <T extends Record<any, any>>(record: T): T =>
  Object.fromEntries(Object.entries(record).sort((a, b) => a[0].localeCompare(b[0]))) as T;

export const getChanges = (source: any, target: any): any => {
  if (source === target) return undefined;
  if (!isObject(source) || !isObject(target) || isArray(source) || isArray(target)) return target;
  const result: any = {};
  const allKeys = uniq([...Object.keys(source), ...Object.keys(target)]);
  if (allKeys.length === 0) return undefined;
  for (const key of allKeys) {
    const sourceChild = source[key];
    const targetChild = target[key];
    if (sourceChild === targetChild) continue;
    if (targetChild === undefined) {
      result[key] = undefined;
      continue;
    }
    const changes = getChanges(sourceChild, targetChild);
    if (changes === undefined) continue;
    result[key] = changes;
  }
  return result;
};

export const deleteKey = <T>(record: Record<string, T>, ...keys: string[]): Record<string, T> => {
  for (const key of keys) delete record[key];
  return record;
};

export const clone = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) return obj;
  let c: any;
  if (Array.isArray(obj)) {
    c = [];
    for (let i = 0, l = obj.length; i < l; i++) {
      c[i] = clone(obj[i]);
    }
  } else {
    c = {};
    const keys = Object.keys(obj);
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      c[key] = clone((obj as any)[key]);
    }
  }
  return c as T;
};
