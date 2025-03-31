import { CSSProperties } from 'react';

interface FlexCSSProperties {
    display?: CSSProperties['display'],
    flexDirection?: CSSProperties['flexDirection'],
    justifyContent?: CSSProperties['justifyContent'],
    alignItems?: CSSProperties['alignItems'],
    gap?: CSSProperties['gap'],
    flexWrap?: CSSProperties['flexWrap'],
    flexGrow?: CSSProperties['flexGrow'],
    flexShrink?: CSSProperties['flexShrink'],
    flexBasis?: CSSProperties['flexBasis'],
    flex?: CSSProperties['flex'],
    order?: CSSProperties['order'],
    alignSelf?: CSSProperties['alignSelf'],
    minWidth?: CSSProperties['minWidth'],
    maxWidth?: CSSProperties['maxWidth'],
    minHeight?: CSSProperties['minHeight'],
    maxHeight?: CSSProperties['maxHeight'],
}

type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type FlexWrap = 1 | 0 | 'wrap' | 'nowrap' | 'wrap-reverse';
type FlexGrow = 0 | 1 | 'initial' | 'inherit';
type FlexShrink = 0 | 1 | 'initial' | 'inherit';

const JUSTIFY_MAP: Record<FlexJustify, CSSProperties['justifyContent']> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly'
} as const;

const ALIGN_MAP: Record<FlexAlign, CSSProperties['alignItems']> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline'
} as const;

const WRAP_MAP: Record<FlexWrap, CSSProperties['flexWrap']> = {
    1: 'wrap',
    0: 'nowrap',
    wrap: 'wrap',
    nowrap: 'nowrap',
    'wrap-reverse': 'wrap-reverse'
} as const;

interface FlexBoxOptions {
    direction?: FlexDirection,
    align?: FlexAlign;
    justify?: FlexJustify;
    gap?: number | string;
    wrap?: FlexWrap;
    grow?: FlexGrow;
    shrink?: FlexShrink;
    basis?: string | number;
    flex?: string | number;
    order?: number;
    alignSelf?: FlexAlign;
}

/**
 * Génère les propriétés flex pour le système sx de MUI
 * @param options - Options de configuration flex
 * @returns SxProps<Theme> - Propriétés sx compatibles avec MUI
 */
export const flexBox = (options: FlexBoxOptions = {}): FlexCSSProperties => {
    const {
        direction,
        align,
        justify,
        gap,
        wrap,
        grow,
        shrink,
        basis,
        flex,
        order,
        alignSelf,
    } = options;

    const r: FlexCSSProperties = { display: 'flex' };

    if (direction !== undefined) r.flexDirection = direction;
    if (justify !== undefined) r.justifyContent = JUSTIFY_MAP[justify] || justify;
    if (align !== undefined) r.alignItems = ALIGN_MAP[align] || align;
    if (gap !== undefined) r.gap = gap;
    if (wrap !== undefined) r.flexWrap = WRAP_MAP[wrap];
    if (grow !== undefined) r.flexGrow = grow;
    if (shrink !== undefined) r.flexShrink = shrink;
    if (basis !== undefined) r.flexBasis = basis;
    if (flex !== undefined) r.flex = flex;
    if (order !== undefined) r.order = order;
    if (alignSelf !== undefined) r.alignSelf = ALIGN_MAP[alignSelf] || alignSelf;

    return r;
};

export const flexCenter = (options: FlexBoxOptions = {}) => flexBox({ align: 'center', justify: 'center', ...options });
export const flexRow = (options: FlexBoxOptions = {}) => flexBox({ direction: 'row', ...options });
export const flexColumn = (options: FlexBoxOptions = {}) => flexBox({ direction: 'column', ...options });