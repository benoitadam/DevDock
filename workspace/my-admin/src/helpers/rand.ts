export const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const randHex10 = () => Math.random().toString(16).substring(2, 12).padEnd(10, '0');

export const randString = (length: number, radix: number = 16) => {
    const sb = [];
    while (sb.length < length) sb.push(...Array.from(Math.random().toString(radix).substring(2)));
    return sb.join('').substring(0, length);
}

export default rand;