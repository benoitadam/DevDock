import { isNumber } from "./check";
import { clamp, round } from "./nbr";

const pInt16 = (hex: string) => parseInt(hex, 16);
const pFloat = (val: string) => parseFloat(val);

/**
 * RGB color representation
 * - r, g, b: 0-255 integer values
 * - a: 0-1 alpha value with 2 decimal precision
 */
export type RgbColor = { r:number, g:number, b:number, a:number };

/**
 * HSL color representation
 * - h: 0-360 hue angle in degrees
 * - s: 0-100 saturation percentage
 * - l: 0-100 lightness percentage
 * - a: 0-1 optional alpha value
 */
export type HslColor = { h:number, s:number, l:number, a:number };

/**
 * Creates a new RGB color array with properly rounded values
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Alpha component (0-1), defaults to 1
 * @returns RGB tuple with properly rounded values
 */
export const rgbColor = (r: number, g: number, b: number, a: number = 1): RgbColor => {
    // RGB values must be integers between 0-255, alpha must be between 0-1 with 2 decimal places
    return {
        r: round(clamp(r, 0, 255)), 
        g: round(clamp(g, 0, 255)), 
        b: round(clamp(b, 0, 255)), 
        a: round(clamp(a, 0, 1), 2)
    };
}

const hslToRgb = (hsl: HslColor): RgbColor => {
    // Handle HSL format
    const h = hsl.h / 360; // Normalize to 0-1 range
    // Handle both 0-1 and 0-100 scale for s and l
    const s = clamp(hsl.s / 100, 0, 1);
    const l = clamp(hsl.l / 100, 0, 1);
    const a = typeof hsl.a === 'number' ? hsl.a : 1;
    let r, g, b;
    
    if (s === 0) {
        // Achromatic (gray)
        r = g = b = l;
    } else {
        // HSL to RGB conversion algorithm
        const hue2rgb = (p: number, q: number, t: number): number => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return rgbColor(r * 255, g * 255, b * 255, a);
}

// var colorRegex = (() => {
//     const space = '\\s*'
//     const nbr = '(\\d*\\.?\\d+)'
//     const angleUnit = '(deg|rad|turn|)'
//     const prctUnit = '(%|)'
//     const angleVal = space + nbr + angleUnit + space + ',?'
//     const prctVal = space + nbr + angleUnit + space + ',?'
//     const open = space + '\\('
//     const close = '\\)' + space
//     const colorRegex = new RegExp('^([rgbhsla]+)' + open + angleVal + prctVal + prctVal + '(' + prctVal + ')?' + close + '$', 'i');
//     return colorRegex
// })()

export const stringToColor = (color: string): RgbColor|HslColor => {
    const p = color.split(/[\s,\(\)%#]+/)

    if (p[0] === '') p.shift()

    const f = p[0]
    const l = f.length
    
    if (l === 6 || l === 8) { // #RRGGBB or #RRGGBBAA
        return {
            r: pInt16(f[0] + f[1]),
            g: pInt16(f[2] + f[3]),
            b: pInt16(f[4] + f[5]),
            a: l === 8 ? pInt16(f[6] + f[7])/255 : 1,
        };
    }
    else if (l === 3 || l === 4) { // #RGB or #RGBA
        if (f.match(/rgb/i)) { // rgba(255, 0, 0, 0.5)
            return {
                r: pFloat(p[1]),
                g: pFloat(p[2]),
                b: pFloat(p[3]),
                a: p[4] ? pFloat(p[4]) : 1
            };
        }
        else if (f.match(/hsl/i)) { // hsla(120, 100%, 50%, 0.3)
            return {
                h: pFloat(p[1]),
                s: pFloat(p[2]),
                l: pFloat(p[3]),
                a: p[4] ? pFloat(p[4]) : 1
            };
        }
        return {
            r: pInt16(f[0] + f[0]),
            g: pInt16(f[1] + f[1]),
            b: pInt16(f[2] + f[2]),
            a: l === 4 ? pInt16(f[3] + f[3])/255 : 1,
        };
    }

    throw new Error('no string color')
}

/**
 * Converts any color format to RGB
 * @param color - Color in any supported format
 * @returns RGB tuple [r, g, b, a]
 */
export const toRgb = (c: any): RgbColor => {
    if (typeof c === 'object') { // Handle object formats
        if (typeof c.r === 'number') { // Handle { r, g, b, a? } object
            return rgbColor(c.r, c.g, c.b, typeof c.a === 'number' ? c.a : 1);
        }        
        if (typeof c.h === 'number') { // Handle { h, s, l, a? } object
            return hslToRgb(c);
        }
        if (Array.isArray(c)) { // Handle array format [r, g, b] or [r, g, b, a]
            return rgbColor(c[0], c[1], c[2], c.length >= 4 ? c[3] : 1);
        }
        throw new Error('toRgb object' + JSON.stringify(c))
    }
    if (typeof c === 'string') { // Handle string formats
        return toRgb(stringToColor(c));
    }
    if (typeof c === 'number') { // Handle grayscale (single number)
        return rgbColor(c, c, c, 1);
    }
    
    throw new Error('toRgb fallback' + JSON.stringify(c))
}

/**
 * Converts any color format to HSL
 * @param color - Color in any supported format
 * @returns HSL tuple [h, s, l, a] with h: 0-360, s: 0-100, l: 0-100, a: 0-1
 */
export const toHsl = (color: any): HslColor => {
    const rgb = toRgb(color);
    
    // Normalize RGB values to 0-1 range
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 
            ? d / (2 - max - min) 
            : d / (max + min);
            
        // Calculate hue
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        
        h = h * 60; // Convert to degrees
    }

    return {
        h: round(h, 1), 
        s: round(s * 100, 2), 
        l: round(l * 100, 2), 
        a: rgb.a,
    };
}

/**
 * Converts any color to CSS RGB/RGBA string format
 * @param color - Color in any supported format
 * @returns CSS color string (rgb or rgba)
 */
export const toRgbString = (color: any): string => {
    const {r,g,b,a} = toRgb(color);
    return a !== 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts any color to CSS HSL/HSLA string format
 * @param color - Color in any supported format
 * @returns CSS color string (hsl or hsla)
 */
export const toHslString = (color: any): string => {
    const {h,s,l,a} = toHsl(color);
    return a !== 1 ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Converts any color format to hexadecimal string
 * @param color - Color in any supported format
 * @returns Hex color string (#RRGGBB or #RRGGBBAA if alpha < 1)
 */
export const toHex = (color: any): string => {
    const {r,g,b,a} = toRgb(color);
    
    // Function to convert numeric value to padded hex without rounding up
    const f = (n: number): string => {
        // Use floor instead of round to avoid rounding up values like FE to FF
        const hex = Math.floor(n).toString(16);
        return hex.length < 2 ? "0" + hex : hex;
    };
    
    // Return #RRGGBB if alpha is 1 else #RRGGBBAA
    const hex = '#' + f(r) + f(g) + f(b)
    return a === 1 ? hex : hex + f(a * 255)
}

export const addRgb = (color: any, values: Partial<RgbColor>) => {
    color = toRgb(color)
    if (isNumber(values.r)) color.r += values.r
    if (isNumber(values.g)) color.g += values.g
    if (isNumber(values.b)) color.b += values.b
    if (isNumber(values.a)) color.a += values.a
    return toHex(color)
}

export const addHsl = (color: any, values: Partial<HslColor>) => {
    color = toHsl(color)
    if (isNumber(values.h)) color.h += values.h
    if (isNumber(values.s)) color.s += values.s
    if (isNumber(values.l)) color.l += values.l
    if (isNumber(values.a)) color.a += values.a
    return toHex(color)
}

export const setRgb = (color: any, values: Partial<RgbColor>) => {
    color = toRgb(color)
    if (isNumber(values.r)) color.r = values.r
    if (isNumber(values.g)) color.g = values.g
    if (isNumber(values.b)) color.b = values.b
    if (isNumber(values.a)) color.a = values.a
    return toHex(color)
}

export const setHsl = (color: any, values: Partial<HslColor>) => {
    color = toHsl(color)
    if (isNumber(values.h)) color.h = values.h
    if (isNumber(values.s)) color.s = values.s
    if (isNumber(values.l)) color.l = values.l
    if (isNumber(values.a)) color.a = values.a
    return toHex(color)
}

/**
 * Lightens a color by a specified amount
 * @param color - Color in any supported format
 * @param amount - Amount to lighten (0-100), defaults to 10
 * @returns Hex string of lightened color
 */
export const lighten = (color: any, amount: number = 10): string => addHsl(color, { l: amount })

/**
 * Darkens a color by a specified amount
 * @param color - Color in any supported format
 * @param amount - Amount to darken (0-100), defaults to 10
 * @returns Hex string of darkened color
 */
export const darken = (color: any, amount: number = 10): string => lighten(color, -amount);

/**
 * Mixes two colors with a specified ratio
 * @param color1 - First color in any supported format
 * @param color2 - Second color in any supported format
 * @param ratio - Mix ratio (0-1) where 0 is color1 and 1 is color2, defaults to 0.5
 * @returns Hex string of mixed color
 */
export const mixColor = (color1: any, color2: any, ratio: number = 0.5): string => {
    const a = toRgb(color1);
    const b = toRgb(color2);
    
    return toHex([
        a.r * (1 - ratio) + b.r * ratio,
        a.g * (1 - ratio) + b.g * ratio,
        a.b * (1 - ratio) + b.b * ratio,
        a.a * (1 - ratio) + b.a * ratio
    ]);
}

/**
 * Increases the saturation of a color
 * @param color - Color in any supported format
 * @param amount - Amount to increase saturation (0-100), defaults to 10
 * @returns Hex string of saturated color
 */
export const saturate = (color: any, amount: number = 10): string => addHsl(color, { s: amount })

/**
 * Decreases the saturation of a color
 * @param color - Color in any supported format
 * @param amount - Amount to decrease saturation (0-100), defaults to 10
 * @returns Hex string of desaturated color
 */
export const desaturate = (color: any, amount: number = 10): string => saturate(color, -amount);

/**
 * Inverts a color
 * @param color - Color in any supported format
 * @returns Hex string of inverted color
 */
export const invertColor = (color: any): string => {
    const {r, g, b, a} = toRgb(color);
    return toHex([255 - r, 255 - g, 255 - b, a]);
}

/**
 * Determines if a color is light (lightness > 50%)
 * @param color - Color in any supported format
 * @returns True if the color is light, false otherwise
 */
export const isLight = (color: any): boolean => toHsl(color).l > 50;

/**
 * Generates a random color with optional constraints
 * @param h - Maximum hue (0-360), defaults to 360
 * @param s - Maximum saturation (0-100), defaults to 100
 * @param l - Maximum lightness (0-100), defaults to 100
 * @param a - Maximum alpha transparency (0-1), defaults to 0
 * @returns Hex string of random color
 */
export const randColor = (h: number = 360, s: number = 100, l: number = 100, a: number = 0): string => {
    const r = (max: number) => max > 0 ? Math.random() * max : 0;
    return toHex({ h:r(h), s:r(s), l:r(l), a:1-r(a) });
}