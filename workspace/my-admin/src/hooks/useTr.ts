// import { Msg, setTemplate, useMsg } from "vegi";

// export const translateByKey$ = new Msg<Record<string, string>>({}); 

// export function addTranslates(changes: Record<string, string>, ctx: string = '') {
//     console.debug('addTranslates', changes, ctx);
//     const translateByKey = { ...translateByKey$.v };
//     if (ctx) {
//         for (const key in changes) {
//             translateByKey[ctx + '.' + key] = changes[key];
//         }
//     } else {
//         Object.assign(translateByKey, changes);
//     }
//     console.debug('addTranslates translateByKey', changes, ctx, translateByKey);
//     translateByKey$.set(translateByKey);
// }

// export const tr = (key: string, params?: Record<string, string>) => {
//     const translate = translateByKey$.v[key] || key;
//     return params ? setTemplate(translate, params) : translate;
// };

// export const useTr = (ctx: string = '') => {
//     useMsg(translateByKey$);
//     return ctx ? (key: string, params?: Record<string, string>) => tr(ctx + '.' + key, params) : tr;
// };

// export default useTr;

// addTranslates({
//     loading: 'Chargement...',
// })