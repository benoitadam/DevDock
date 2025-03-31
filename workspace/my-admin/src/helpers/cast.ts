import { isArray, isDate, isNil, isNumber, isRecord, isString } from "./check";

export const me = <T = any>(value: T): T => value;

interface ToArray {
    <T = any>(v: T[] | T | null | undefined): T[];
    <T = any>(v: any, def: T[]): T[];
}
export const toArray = (<T = any>(v: any, def: T[] = []): T[] =>
    isNil(v) ? def : isArray(v) ? v : [v]) as ToArray;

interface ToBoolean {
    (v: boolean | string | number): boolean;
    (v: any): boolean | undefined;
    <T>(v: any, defVal: T): boolean | T;
}
export const toBool = (<T = boolean>(v: any, defVal?: T | boolean): boolean | T | undefined =>
    isString(v)
        ? ['true', 'ok', 'on', '1'].indexOf(String(v).toLowerCase()) !== -1
        : isNil(v)
            ? defVal
            : !!v) as ToBoolean;

export const toClassName = (obj: any): string => {
    if (!obj) return '';
    const constructor = Object.getPrototypeOf(obj).constructor;
    if (constructor instanceof Function) return obj.name || 'Function';
    return constructor.name;
};

interface ToDate {
    (v: any): Date;
    <TDef>(v: any, defVal: TDef): Date | TDef;
    <TDef>(v: any, defVal?: TDef): Date | TDef | undefined;
}
export const toDate = (<TDef>(v: any, defVal?: TDef): Date | TDef | undefined =>
    isDate(v)
        ? v
        : isString(v) || isNumber(v)
            ? new Date(v)
            : isNil(v)
                ? new Date()
                : defVal) as ToDate;

export const toNull = () => null;

interface ToNumber {
    (v: number): number;
    (v: any): number | undefined;
    <D>(v: any, nanVal: D): number | D;
}
export const toNbr = (<D>(v: any, nanVal?: D): number | D | undefined => {
    const clean = isString(v) ? v.replace(/,/g, '.').replace(/[^0-9\-\.]/g, '') : String(v);
    const nbr = clean !== '' ? Number(clean) : Number.NaN;
    return Number.isNaN(nbr) || !Number.isFinite(nbr) ? nanVal : nbr;
}) as ToNumber;

interface ToRecord {
    <T = any>(v: T): T;
    <T = any>(v: T | null | undefined): T | undefined;
    <T = any, U = any>(v: T | null | undefined, def: U): T | U;
}
export const toRecord = (<T = any>(v: any, def: T = {} as any): T =>
    isRecord(v) ? v : def) as ToRecord;

export const toStr = (v: any, def: string = ''): string => (isNil(v) ? def : String(v));

export const toVoid = () => {};

