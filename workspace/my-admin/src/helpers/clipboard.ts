import { stringify, parse } from './json';

export const clipboardCopy = async (value: any): Promise<void> => {
  localStorage.setItem('__copy', value);
  try {
    await navigator.clipboard.writeText(stringify(value) || '');
  }
  catch(e) {}
};

export const clipboardPaste = async () => {
  try {
    const json = await navigator.clipboard.readText();
    return parse(json) || json;
  }
  catch(e) {
    return Promise.resolve(localStorage.getItem('__copy'));
  }
};