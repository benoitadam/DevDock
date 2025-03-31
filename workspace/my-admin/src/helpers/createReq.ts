import { Err, toErr } from "./err";
import { parse, stringify } from "./json";
import pathJoin from "./pathJoin";

export type FormDataObject = { [prop: string]: any };
export type ReqURL = string | URL;
export type ReqMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
export type ReqParams = Record<string, undefined | string | number | (string | number)[]>;
export type ReqData = any;
export type ReqHeaders = Record<string, string>;
export type ReqBody = Document | XMLHttpRequestBodyInit | File | null | undefined;
export type ReqResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';

export interface ReqOptions<T = any> {
    url?: ReqURL;
    method?: ReqMethod | null;
    headers?: ReqHeaders;
    baseUrl?: string | null;
    timeout?: number | null;
    params?: ReqParams | null;
    // data?: ReqData | null;
    body?: ReqBody | null;
    json?: ReqData;
    form?: FormDataObject | FormData | null;
    responseType?: ReqResponseType | null;
    noCache?: boolean | null;
    xhr?: boolean | XMLHttpRequest | null;
    fetch?: boolean | ((input: URL, init?: RequestInit) => Promise<Response>) | null;
    base?: (options: ReqOptions<T>) => void | Promise<void> | null;
    before?: (ctx: ReqContext<T>) => void | Promise<void> | null;
    after?: (ctx: ReqContext<T>) => void | Promise<void> | null;
    cast?: (ctx: ReqContext<T>) => T | Promise<T> | null;
    onProgress?: (progress: number, ctx: ReqContext<T>) => void | null;
    request?: <T>(ctx: ReqContext<T>) => Promise<T> | null;
    cors?: boolean | null;
    password?: string | null;
    username?: string | null;
}

export interface ReqContext<T = any> {
    options: ReqOptions<T>;
    url: URL;
    method: ReqMethod;
    responseType: ReqResponseType;
    params: ReqParams;
    headers: ReqHeaders;
    body: ReqBody;
    timeout?: number;
    event?: any;
    status?: number;
    ok: boolean;
    data?: T | null;
    error?: any;
    xhr?: XMLHttpRequest;
    response?: Response;
    fetchInit?: RequestInit;
}

const acceptJson = 'application/json';
const acceptMap: Partial<Record<ReqResponseType, string>> = {
    json: acceptJson,
    text: 'text/*; charset=utf-8',
    blob: '*/*',
    document: 'text/html, application/xhtml+xml, application/xml; q=0.9; charset=utf-8',
    arraybuffer: '*/*',
};

export const toFormData = (form: FormDataObject | FormData | null | undefined, base?: FormData) => {
    if (!form) return;
    if (form instanceof FormData) return form;
    const r = base || new FormData();
    Object.entries(form).forEach(([prop, val]) => {
        if (val === undefined) return;
        if (typeof val === 'object') {
            if (Array.isArray(val) && (val[0] instanceof File || val[0] instanceof Blob)) {
                for (const file of val) {
                    if (file instanceof File || file instanceof Blob) {
                        r.append(prop, file);
                    }
                }
                return;
            }
            else if (val instanceof File || val instanceof Blob) {
                //
            }
            else {
                val = JSON.stringify(val);
            }
        } else {
            val = String(val);
        }
        r.append(prop, val);
    });
    return r;
}

export const reqXHR = async <T = any>(ctx: ReqContext<T>): Promise<void> => {
    try {
        const o = ctx.options;
        const xhr: XMLHttpRequest = ctx.xhr || (ctx.xhr = new XMLHttpRequest());

        xhr.timeout = ctx.timeout || 20000;
        const responseType = (xhr.responseType = ctx.responseType || 'json');

        if (o.cors) xhr.withCredentials = true;

        xhr.open(ctx.method, ctx.url, true, o.username, o.password);

        if (o.cors) xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        for (const key in ctx.headers) {
            const val = ctx.headers[key];
            xhr.setRequestHeader(key, val);
        }

        const onProgress = o.onProgress;
        if (onProgress) {
            const _onProgress = (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
                ctx.event = event;
                onProgress(event.loaded / event.total, ctx);
            };
            xhr.addEventListener('progress', _onProgress);
            xhr.upload?.addEventListener('progress', _onProgress);
        }

        if (o.before) await o.before(ctx);
        await new Promise<void>((resolve) => {
            const cb = async () => {
                let data = xhr.response as any;
                if (responseType === 'text') data = String(data);
                else if (responseType === 'json') data = typeof data === 'string' ? parse(data) || data : data;
                ctx.data = data;
                ctx.response = xhr.response;
                ctx.status = xhr.status;
                ctx.headers = {};
                ctx.ok = xhr.status < 400;
                if (!ctx.ok) ctx.error = new Error(xhr.statusText);
                resolve();
            };
            xhr.onloadend = xhr.onerror = xhr.ontimeout = xhr.onabort = cb;
            xhr.send(ctx.body);
        });
    } catch (error) {
        ctx.error = error;
        ctx.ok = false;
    }
};

export const reqFetch = async <T = any>(ctx: ReqContext<T>): Promise<void> => {
    try {
        const o = ctx.options;
        const fetchRequest: RequestInit = (ctx.fetchInit = {
            body: ctx.body as any,
            headers: ctx.headers,
            method: ctx.method,
        });

        if (ctx.timeout) fetchRequest.signal = AbortSignal.timeout(ctx.timeout);

        if (o.before) await o.before(ctx);
        const response = await (typeof o.fetch === 'function' ? o.fetch : fetch)(ctx.url, fetchRequest);
        ctx.response = response;
        ctx.status = response.status;
        ctx.ok = response.ok;

        if (o.cast) {
            ctx.data = await o.cast(ctx);
            return;
        }
        else {
            switch (ctx.responseType) {
                case 'blob':
                    ctx.data = (await response.blob()) as T;
                    break;
                case 'json':
                    const objAny: any = (await response.json()) as any;
                    const obj = objAny as T;
                    ctx.data = typeof obj === 'string' ? parse(obj) || obj : obj;
                    break;
                case 'text':
                    ctx.data = (await response.text()) as T;
                    break;
                case 'arraybuffer':
                    ctx.data = (await response.arrayBuffer()) as T;
                    break;
            }
        }   
    } catch (error) {
        ctx.error = error;
        ctx.ok = false;
    }
};


const _req = async <T>(options?: ReqOptions<T>): Promise<T> => {
    const o = { ...options };
    if (o.base) o.base(o);
    if (!o.url) throw new Err('no-url', { options: o });

    const headers: ReqHeaders = {};
    const params = o.params || {};
    const responseType = o.responseType || 'json';
    const json = o.json;
    const baseUrl = o.baseUrl || (location.protocol + '//' + location.host);

    const url = (() => {
        const oUrl = o.url
        if (typeof oUrl === 'string') {
            if (oUrl.match(/^https?:\/\//)) return new URL(oUrl)
            return new URL(pathJoin(baseUrl, oUrl))
        }
        return oUrl
    })()

    const method = (o.method || 'GET').toUpperCase();
    const timeout = o.timeout;
    const formData = toFormData(o.form);

    if (o.noCache) {
        headers['Cache-Control'] = 'no-cache, no-store, max-age=0';
        headers.Expires = 'Thu, 1 Jan 1970 00:00:00 GMT';
        headers.Pragma = 'no-cache';
        params.noCache = Date.now();
    }

    // if (formData) headers['Content-Type'] = headers['Process-Data'] = 'multipart/form-data';

    headers.Accept = acceptMap[responseType] || acceptJson;

    const body = o.body || (json ? formData ? toFormData(json, formData) : stringify(json) : formData);
    if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof File)) {
        headers['Content-Type'] = 'application/json';
    }

    const oHeaders = o.headers;
    if (oHeaders) Object.assign(headers, oHeaders);

    for (const key in params) {
        const v = params[key];
        url.searchParams.set(key, typeof v === 'string' ? v : stringify(v));
    }

    const ctx = {
        options: o,
        url,
        method,
        responseType,
        params,
        headers,
        body,
        timeout,
        ok: false,
    } as ReqContext<T>;

    try {
        const request = o.request || (o.fetch ? reqFetch : reqXHR);
        console.debug('req url', o.url);
        await request(ctx as any);
        console.debug('req result', o.url, ctx);
        if (o.cast) ctx.data = await o.cast(ctx);
        if (o.after) await o.after(ctx);
        console.debug('req data', ctx.data);
    } catch (error) {
        console.debug('req error', o.url, error);
        ctx.error = error;
        ctx.ok = false;
    }

    const error = ctx.error;
    if (error) {
        const err = toErr(error, { ...ctx, ...ctx.data })
        console.warn('req throw error', err.toJSON());
        throw err;
    }

    return ctx.data as T;
};

export interface Req {
    <T = any>(method: ReqMethod, url: string, options?: ReqOptions<T>): Promise<T>;
    <T = any>(options: ReqOptions<T>): Promise<T>;
}

const createReq = (baseOptions: ReqOptions): Req => {
    return <T = any>(optionsOrMethod: ReqMethod|ReqOptions<T>|null, url?: string|null, options?: ReqOptions<T>): Promise<T> => (
        _req<T>((optionsOrMethod && typeof optionsOrMethod === 'object') ? {
            ...baseOptions,
            ...optionsOrMethod,
        } : {
            ...baseOptions,
            method: optionsOrMethod,
            url: url!,
            ...options,
        })
    )
}

export const req = createReq({});

export default createReq;