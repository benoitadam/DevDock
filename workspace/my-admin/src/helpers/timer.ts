import { randString } from "./rand";

const glb = window as any;
const timers: Record<string, any> = (glb).m4kTimers || (glb.m4kTimers = {});

const timer = (id: null|string, ms: number, cb: null|(() => void)) => {
    if (!id) id = randString(10) + Date.now();
    if (timers[id]) {
        clearInterval(timers[id]);
        delete timers[id];
    }
    if (ms > 0 && cb) {
        timers[id] = setInterval(cb, ms);
    }
}

export default timer;