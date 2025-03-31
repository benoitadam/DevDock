import { isEqual } from "./check";
import { round } from "./nbr";

export type Style = Partial<CSSStyleDeclaration>;

export type HTMLAllElement = HTMLDivElement &
    HTMLInputElement &
    HTMLVideoElement &
    HTMLImageElement &
    HTMLHeadingElement;

export type Drag = {
    e?: DragEvent;
    el: HTMLElement;
    x0: number;
    y0: number;
    x: number;
    y: number;
    dX0: number;
    dY0: number;
    dX: number;
    dY: number;
    dispose: () => void;
};

export const createEl = document.createElement.bind(document);

const _cssFiles: Record<string, HTMLLinkElement> = {};
export const addCssFile = (url: string): HTMLLinkElement => {
    if (_cssFiles[url]) return _cssFiles[url];
    const el = createEl('link');
    el.rel = 'stylesheet';
    el.type = 'text/css';
    el.href = url;
    _cssFiles[url] = document.head.appendChild(el);
    return el;
};

export const addEl = (
    containerEl: HTMLElement,
    ...els: (HTMLElement | undefined | null | false)[]
) => {
    for (const el of els) el && containerEl.appendChild(el);
};

const _jsFiles: Record<string, HTMLScriptElement> = {};
export const addJsFile = (url: string): HTMLScriptElement => {
    if (_jsFiles[url]) return _jsFiles[url];
    const el = createEl('script');
    el.type = 'text/javascript';
    el.async = true;
    el.src = url;
    _jsFiles[url] = document.head.appendChild(el);
    return el;
};

export const addListener = <K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLElement>(
    element: T | 0,
    type: K,
    listener: (this: T, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
): (() => void) => {
    const el = element === 0 ? document.body : element
    const handler = listener as (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
    el.addEventListener(type, handler, options);
    return () => el.removeEventListener(type, handler, options);
};

export const addListeners = <K extends keyof HTMLElementEventMap>(
    element: HTMLElement | 0,
    listeners: Record<K, (this: HTMLElement, ev: HTMLElementEventMap[K]) => any>,
    optionsMap?: Record<K, boolean | AddEventListenerOptions>,
): (() => void) => {
    const el = element === 0 ? document.body : element;
    for (const type in listeners) {
        el.addEventListener(type, listeners[type], optionsMap ? optionsMap[type] : undefined);
    }
    return () => {
        for (const type in listeners) {
            el.removeEventListener(type, listeners[type]);
        }
    }
};

export const autoScrollEnd = (el?: HTMLElement|null) => {
    if (!el) return
    let lastUserScroll = 0
    let isAutoScrolling = false;
    let timer = setInterval(() => {
        const isUserScroll = lastUserScroll + 5000 > Date.now()
        const scrollTopMax = el.scrollHeight - el.clientHeight
        const isAtBottom = Math.abs(el.scrollTop - scrollTopMax) < 2
        if (isUserScroll || isAtBottom) {
            isAutoScrolling = false
            return
        }
        isAutoScrolling = true
        el.scrollTop = scrollTopMax
        el.scrollLeft = 0
    }, 200)
    const unsubscribe = addListener(el, 'scroll', () => {
        if (isAutoScrolling) return
        const scrollTopMax = el.scrollHeight - el.clientHeight
        const isAtBottom = Math.abs(el.scrollTop - scrollTopMax) < 5
        lastUserScroll = isAtBottom ? 0 : Date.now()
    })
    return () => {
        clearInterval(timer)
        unsubscribe()
    }
}

export interface EventXY {
    x: number;
    y: number;
}

export const eventStop = (e: any) => {
    if (e) {
        if (e.preventDefault) e.preventDefault()
        if (e.stopPropagation) e.stopPropagation()
    }
}

export const eventXY = (ev: MouseEvent | TouchEvent | Touch): EventXY => {
    const e = ev instanceof TouchEvent ? ev.touches[0] : ev;
    return e ? { x: e.clientX, y: e.clientY } : { x: 0, y: 0 };
};


export const getAttrs = (el: Element) =>
    Object.fromEntries(el.getAttributeNames().map((name) => [name, el.getAttribute(name)]));

export const setAttrs = (el: Element, attrs: Record<string, any>, update?: boolean) => {
    if (!update) for (const a of Array.from(el.attributes)) el.removeAttribute(a.name);
    for (const n in attrs) el.setAttribute(n, attrs[n]);
};


export type Cls = Record<string, boolean | number | undefined | null>;

export const getCls = (el: Element): Cls =>
    Object.fromEntries(el.className.split(' ').map((k) => [k, true]));

export const setCls = (el: Element, cls: Cls | string, replace?: boolean) => {
    if (typeof cls === 'string') {
        el.className = cls;
        return;
    }
    if (replace) el.className = '';
    const list = el.classList;
    for (const name in cls) {
        const isAdd = cls[name];
        isAdd ? list.add(name) : list.remove(name);
    }
};

type Em = number|string|(number|string)[];
const em = (v: Em): string => typeof v === 'number' ? v + 'em' : typeof v === 'string' ? v : v.map(em).join(' ');
const cssFunMap = {
    w: (v: Em) => `width:${em(v)};`,
    h: (v: Em) => `height:${em(v)};`,

    fontSize: (v: Em) => `font-size:${em(v)};`,

    m: (v: Em) => `margin:${em(v)};`,
    mt: (v: Em) => `margin-top:${em(v)};`,
    mb: (v: Em) => `margin-bottom:${em(v)};`,
    ml: (v: Em) => `margin-left:${em(v)};`,
    mr: (v: Em) => `margin-right:${em(v)};`,
    mx: (v: Em) => `margin-left:${em(v)};margin-right:${em(v)};`,
    my: (v: Em) => `margin-top:${em(v)};margin-bottom:${em(v)};`,

    p: (v: Em) => `padding:${em(v)};`,
    pt: (v: Em) => `padding-top:${em(v)};`,
    pb: (v: Em) => `padding-bottom:${em(v)};`,
    pl: (v: Em) => `padding-left:${em(v)};`,
    pr: (v: Em) => `padding-right:${em(v)};`,
    px: (v: Em) => `padding-left:${em(v)};padding-right:${em(v)};`,
    py: (v: Em) => `padding-top:${em(v)};padding-bottom:${em(v)};`,

    elevation: (v: number) => `box-shadow:${em(v*.1)} ${em(v*.2)} ${em(v*.25)} 0px rgba(0,0,0,0.6);`,
    rounded: (v: number) => `border-radius:${em(v*.2)};`,

    inset: (v: string|number) => `top:${em(v)};right:${em(v)};bottom:${em(v)};left:${em(v)};`,

    bg: (v: string) => `background-color:${v};`,
    fg: (v: string) => `color:${v};`,
    bgUrl: (v: string) => `background-image: url('${v}');`,
    bgMode: (v: 'contain'|'cover'|'fill') => `background-repeat:no-repeat;background-position:center;background-size:${v === 'fill' ? '100% 100%' : v};`,

    itemFit: (v: 'contain'|'cover'|'fill') =>
        v === 'contain' ? `object-fit:contain;max-width:100%;max-height:100%;` :
        v === 'cover' ? `object-fit:cover;min-width:100%;min-height:100%;` :
        v === 'fill' ? `object-fit:fill;min-width:100%;min-height:100%;` : '',
    
    anim: (v: boolean) => v ? `transition: all 0.3s ease;` : '',
}

type CssFunMap = typeof cssFunMap
type CssRecord = React.CSSProperties & {
    [K in keyof CssFunMap]?: Parameters<CssFunMap[K]>[0]
}
export type Css = null|string|string[]|Record<string, CssRecord>;

const _cssMap: { [key: string]: [HTMLElement, Css] } = {};
export const setCss = (key: string, css?: Css) => {
    const old = _cssMap[key];
    if (old) {
        if (isEqual(old[1], css)) return;
        old[0].remove();
        delete _cssMap[key];
    }
    if (css) {
        const el = createEl('style');
        let content = '';
        if (typeof css === 'object') {
            if (Array.isArray(css)) {
                content = css.join('\n');
            }
            else {
                const sb = [];
                const kPrefix = '.' + key;
                for (const k in css) {
                    sb.push(`${k.replace(/&/g, kPrefix)} {`);
                    const props = css[k];
                    for (const prop in props) {
                        const value = (props as any)[prop];
                        if (prop in cssFunMap) {
                            sb.push('  ' + (cssFunMap as any)[prop](value));
                        } else {
                            const name = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                            sb.push(`  ${name}:${value};`);
                        }
                    }
                    sb.push('}');
                }
                content = sb.join('\n');
            }
        } else {
            content = String(css);
        }
        el.textContent = content;
        document.head.appendChild(el);
        _cssMap[key] = [el, css];
    }
    return key
};

export const htmlToEl = (html: string) => {
    const el = createEl('div');
    el.innerHTML = html;
    return el.children[0];
};

export const setStyle = (el: HTMLElement, style: Style | string, update?: boolean) => {
    if (typeof style === 'string') return setAttrs(el, { style }, true);
    if (!update) setAttrs(el, { style: '' }, true);
    Object.assign(el.style, style);
};

export type ElOptions = Omit<Omit<Partial<HTMLAllElement>, 'children'>, 'style'> & {
    readonly reset?: boolean;
    readonly cls?: Cls;
    readonly style?: Style;
    readonly attrs?: Record<string, any>;
    readonly children?: HTMLElement[];
    readonly ctn?: string;
};

export const setEl = (el: HTMLElement | keyof HTMLElementTagNameMap, options?: ElOptions) => {
    if (typeof el === 'string') el = createEl(el) as HTMLElement;
    if (!options) return el;

    const { reset, attrs, style, cls, children, ctn, ...rest } = options;

    if (reset) setAttrs(el, {});
    if (attrs) setAttrs(el, attrs, true);
    if (style) setStyle(el, style, true);
    if (cls) setCls(el, cls, true);
    if (ctn) el.innerHTML = ctn;

    Object.assign(el, rest);

    if (children) for (const childEl of children) el.appendChild(childEl);

    return el;
};

export const newDialog = (options: ElOptions = {}) => {
    setCss('mDialog', '.mDialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 999999;' +
        'min-width: 30%; max-width: 90%; min-height: 30%; max-height: 90%; overflow: auto; padding: 10px;' +
        'background-color: white; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); border-radius: 7px;' +
        'display: flex; flex-direction: column; align-items: stretch; justify-content: space-around; }');
    return setEl('div', { ...options, cls: { ...options.cls, mDialog: 1 } });
}

let progDialogEl: HTMLElement;
export const newProg = ({ title, max, ...options }: Omit<ElOptions, 'max'> & { title: string, max?: number }) => {
    if (!max) max = 100;
    setCss('mProg',
        '.mProg { border-radius: 5px; margin: 5px; }' +
        '.mProgTitle { text-align: center; font-weight: bold; font-size: 1.2rem; margin: 5px; color: #666666; }' +
        '.mProgTitle b { font-weight: bold; font-size: 2rem; margin-right: 5px; color: #0072c3; }' +
        '.mProgBar { height: 1rem; background: #e0e0e0; border-radius: 99px; overflow: hidden; margin: 5px; }' +
        '.mProgVal { height: 100%; width: 0%; background: #0043ce; border-radius: 99px; transition: all 0.5s; }'
    );
    const valEl = setEl('div', { cls: { mProgVal: 1 } });
    const barEl = setEl('div', { cls: { mProgBar: 1 }, children: [valEl] });
    const titleEl = setEl('span', { cls: { mProgTitle: 1 }, ctn: title });
    const el = setEl('div', {
        ...options,
        cls: { ...options.cls, mProg: 1 },
        children: [titleEl, barEl],
    });
    const dialogEl = progDialogEl || (progDialogEl = newDialog());
    let timeoutId: any;
    let curr: number = -1;
    const set = (value: number) => {
        clearTimeout(timeoutId);
        if (value >= max) value = max;
        if (curr === value) return;
        curr = value;
        if (!dialogEl.parentElement) document.body.append(dialogEl);
        if (!el.parentElement) dialogEl.append(el);
        valEl.style.width = (100*value/max) + '%';
        setEl(titleEl, { ctn: `<b>${round(100*value/max)}%</b>${title}` });
        if (value !== max) return;
        timeoutId = setTimeout(() => {
            el.remove();
            if (dialogEl.children.length === 0) dialogEl.remove();
        }, 1000);
    };
    set(0);
    return set;
}

export const setSiteTitle = (title: string) => {
    const titleEl = document.getElementsByTagName('title')[0];
    if (titleEl) titleEl.innerText = title;
    document.title = title;
};

