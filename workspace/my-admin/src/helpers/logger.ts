import { createEl, setCss } from "@/helpers/html";

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogItem = [LogLevel, number, any[], HTMLDivElement | null];
export type LogInfo = { level: LogLevel, logged: number, message: string };

const firstLog: LogItem = ["info", Date.now(), ["init"], null];
const logs: LogItem[] = [firstLog];
let consoleEl: HTMLDivElement | null = null;
let lastLogDisplayed: LogItem|undefined = undefined;
let showIntervalId: any;
let showTimeoutId: any;

const argToStr = (arg: any) => {
  try {
    if (typeof arg !== "object") return JSON.stringify(arg);
    if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
    if (arg instanceof Date) return arg.toLocaleString();
    return JSON.stringify(arg);
  } catch (e) {
    return `${arg}(${typeof arg})`;
  }
}

const getLogMessage = (args: any[]) => {
  const sb = [];
  for (let a of args) sb.push(argToStr(a));
  return sb.join(" ");
}

const c = console as any;
const nDebug = c.debug.bind(c);
const nInfo = c.info.bind(c);
const nWarn = c.warn.bind(c);
const nError = c.error.bind(c);

const g = (type: LogLevel, nativeFun: any) => (
  (...args: any[]) => {
    nativeFun(...args);
    log(type, ...args);
  }
)

const debug = g("debug", nDebug);
const info = g("info", nInfo);
const warn = g("warn", nWarn);
const error = g("error", nError);

// window.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, err?: Error) => {
//   error('onerror event', event);
//   error('onerror source', source, lineno, colno);
//   error('onerror error', err);
// }

const init = () => {
  const c = console as any;
  if (c.isM4k) return;
  c.isM4k = true;
  c.debug = debug;
  c.log = info;
  c.info = info;
  c.warn = warn;
  c.error = error;
};

const show = () => {
  init();
  clearTimeout(showTimeoutId);
  showTimeoutId = setTimeout(hide, 10000);
  if (consoleEl) return;
  consoleEl = createEl("div");
  consoleEl.id = "mLogs";
  setCss('mLogs', `
#mLogs { display: block; position: fixed; left: 1%; top: 1%; width: 96%; height: 96%; overflow: auto; z-index: 999990; }
#mLogs .error { color: red; font-size: 1.4em; font-weight: bold; }
#mLogs .warn { color: orange;font-size: 1.2em; }
#mLogs .info { color: blue; }
#mLogs .debug { color: grey; font-size: 0.8em; }
`);
  document.body.appendChild(consoleEl);
  clearInterval(showIntervalId);
  showIntervalId = setInterval(() => {
    if (!consoleEl) {
      clearInterval(showIntervalId);
      return;
    }
    const lastLog = logs[logs.length-1];
    if (lastLogDisplayed === lastLog) return;
    const start = lastLogDisplayed ? logs.indexOf(lastLogDisplayed) : -1;
    lastLogDisplayed = lastLog;
    for(let i=start+1; i<logs.length; i++) {
      const log = logs[i];
      if (log[3]) {
        consoleEl.appendChild(log[3]);
        continue;
      }
      const el = createEl("div");
      const type = log[0].toLowerCase();
      el.className = type;
      el.innerText = getLogMessage(log[2]);
      log[3] = el;
      consoleEl.appendChild(el);
    }
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }, 1000);
};

const hide = () => {
  if (!consoleEl) return;
  consoleEl.remove();
  consoleEl = null;
};

const log = (type: LogLevel, ...args: any[]) => {
  try {
    const item: LogItem = [type, Date.now(), args, null];
    if (type === "error") show();
    logs.push(item);
    if (logs.length > 300) {
      logs.splice(0, 10);
    }
  } catch { }
};

// const getLogs = (last: number) => {
//   const results: LogInfo[] = [];
//   for (const log of logs) {
//     if (log[1] <= last) continue;
//     results.push({
//       level: log[0],
//       logged: log[1],
//       message: getLogMessage(log[2]),
//     });
//   }
//   return results;
// }
// export const logsConfig: {
//   onUpdate?: (logs: LogInfo[]) => void;
// } = {};
// let _intervalId: any;
// let _lastRemote = 0;
// export const logsRemote = (level?: LogLevel|'') => {
//   clearInterval(_intervalId);
//   if (!level) return;
//   init();
//   setInterval(() => {
//       let logs = getLogs(_lastRemote);
//       if (logs.length === 0) return;

//       const last = logs[logs.length - 1];
//       _lastRemote = last.logged || 0;

//       if (level === 'info') logs = logs.filter(l => l.level !== 'debug');
//       else if (level === 'warn') logs = logs.filter(l => l.level === 'warn' || l.level === 'error');
//       else if (level === 'error') logs = logs.filter(l => l.level === 'error');

//       if (logsConfig.onUpdate) logsConfig.onUpdate(logs);

//       // const deviceId = deviceStorage.getDevice()?.id;
//       // if (!deviceId) return;
//       // api.deviceLogs.create({
//       //   deviceId,
//       //   logs: logs.map(l => `${new Date(l.logged).toISOString().replace('Z', '').split('T')[1]} ${l.level.toUpperCase()} ${l.message}`),
//       // }).catch(error => {
//       //   console.error('deviceRemoteLogs', error);
//       // });
//   }, 5000);
// }


export default {
  init,
  show,
  hide,
  debug,
  info,
  warn,
  error,
};

export const logDebug = debug;
export const logInfo = info;
export const logWarn = warn;
export const logError = error;