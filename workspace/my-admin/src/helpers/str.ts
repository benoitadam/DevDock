///// GENERATED FILE /////

export const clean = (arg: string): string =>
    arg
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w]/g, ' ')
        .trim();

/**
 * words("abc") -> ["abc"]
 * words("abcDef") -> ["abc", "def"]
 * words("abc def") -> ["abc", "def"]
 * @param arg 
 * @returns 
 */
export const words = (arg: string): string[] =>
    clean(arg)
        .replace(/[a-z0-9][A-Z]/g, (s) => s[0] + ' ' + s[1].toLowerCase())
        .replace(/[^a-z0-9A-Z]+/g, () => ' ')
        .toLowerCase()
        .split(' ')
        .filter((s) => s);

export const pascal = (arg: any): string => words(arg).map(firstUpper).join('');

export const camel = (arg: string): string => firstLower(pascal(arg));

export const firstLower = (arg: string): string =>
    arg ? arg[0].toLowerCase() + arg.substring(1) : arg;

export const firstUpper = (arg: string): string =>
    arg ? arg[0].toUpperCase() + arg.substring(1) : arg;

/**
 * @param val
 * @param replaceBySearch
 * @returns
 * @example replace("toto tututoto b!", { toto: 5, b: 'ok' }) => "5 tutu5 ok!"
 */
export const replace = (val: string, replaceBySearch: Record<string, any>): string => {
    val = String(val);
    if ((val as any).replaceAll) {
        for (const key in replaceBySearch)
            val = (val as any).replaceAll(key, replaceBySearch[key] as string);
        return val;
    }
    for (const key in replaceBySearch)
        val = val.replace(
            new RegExp(key.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'),
            replaceBySearch[key],
        );
    return val;
};

/**
* @param template "toto {titi} tutu{titi}" + { titi: 5 } => "toto 5 tutu5"
* @param replaceByKey
* @returns
* @example setTemplate("toto {a} tutu{a} {b}!", { a: 5, b: 'ok' }) => "toto 5 tutu5 ok!"
*/
export const setTemplate = (template: string, replaceByKey: Record<string, any>): string =>
    template.replace(/\{(\w+)\}/g, (s, k) => replaceByKey[k] || s);


export const uuid = (): string => {
    if (typeof crypto === "object") {
        if (crypto.randomUUID) return crypto.randomUUID();
        if (crypto.getRandomValues) {
            var buff = new Uint16Array(8);
            crypto.getRandomValues(buff);
            const S = (i: number) => buff[i].toString(16).padStart(4, '0');
            return S(0) + S(1) + '-' + S(2) + '-' + S(3) + '-' + S(4) + '-' + S(5) + S(6) + S(7);
        }
    }
    let h = '0123456789abcdef';
    let k = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    let u = '',
        i = 0,
        rb = (Math.random() * 0xffffffff) | 0;
    while (i++ < 36) {
        var c = k[i - 1],
            r = rb & 0xf,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        u += c == '-' || c == '4' ? c : h[v];
        rb = i % 8 == 0 ? (Math.random() * 0xffffffff) | 0 : rb >> 4;
    }
    return u;
};

/**
 * Ajoute des charactéres devant la valeur pour atteindre une longueur donnée
 * @param value Valeur à formater
 * @param length Longueur désirée
 * @param fill Caractère de remplissage (défaut: '0')
 */
export const pad = (value: number | string, length: number, fill: number | string = '0'): string => 
    String(value).padStart(length, String(fill));

/**
 * Ajoute des charactéres après la valeur pour atteindre une longueur donnée
 * @param value Valeur à formater
 * @param length Longueur désirée
 * @param fill Caractère de remplissage (défaut: '0')
 */
export const padEnd = (value: number | string, length: number, fill: number | string = '0'): string => 
    String(value).padEnd(length, String(fill));