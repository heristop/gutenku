import {
  h,
  type FunctionalComponent,
  type SVGAttributes,
  type VNode,
} from 'vue';

// Same prop surface as @lucide/vue as used in this codebase, so swapping the
// import source is the whole migration.
export interface InkIconProps extends Partial<SVGAttributes> {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
}

export type InkIcon = FunctionalComponent<InkIconProps>;

export const INK_STROKE_WIDTH = 1.75;

const BASE_STYLE = 'flex-shrink:0;vertical-align:middle';

function toKebab(name: string): string {
  return name
    .replaceAll(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replaceAll(/([0-9])([A-Za-z])/g, '$1-$2')
    .toLowerCase();
}

function isTruthyFlag(value: unknown): boolean {
  return value === true || value === '' || value === 'true';
}

function isSet(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/** True when the caller already decided how assistive tech should treat the icon. */
function hasA11yOverride(attrs: Record<string, unknown>): boolean {
  return (
    isSet(attrs['aria-label']) ||
    isSet(attrs['aria-labelledby']) ||
    isSet(attrs['aria-hidden'])
  );
}

/** Lucide semantics: `absoluteStrokeWidth` keeps the stroke constant in CSS pixels. */
function resolveStroke(
  width: unknown,
  absolute: unknown,
  size: unknown,
): number {
  const base = Number(width ?? INK_STROKE_WIDTH);

  return isTruthyFlag(absolute) ? (base * 24) / Number(size) : base;
}

export function createInkIcon(
  name: string,
  paths: readonly string[] | (() => VNode[]),
): InkIcon {
  const kebab = toKebab(name);

  const Icon: InkIcon = (props, { slots }) => {
    const {
      size = 24,
      strokeWidth,
      'stroke-width': strokeWidthAttr,
      absoluteStrokeWidth,
      'absolute-stroke-width': absoluteAttr,
      color = 'currentColor',
      class: className,
      style,
      ...rest
    } = props as Record<string, unknown>;

    const stroke = resolveStroke(
      strokeWidth ?? strokeWidthAttr,
      absoluteStrokeWidth ?? absoluteAttr,
      size,
    );
    const labelled = hasA11yOverride(rest);

    const children =
      typeof paths === 'function'
        ? paths()
        : paths.map((d) => h('path', { d }));

    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        'stroke-width': stroke,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        ...(labelled ? {} : { 'aria-hidden': 'true' }),
        ...rest,
        class: ['ink-icon', `ink-icon--${kebab}`, className],
        style: [BASE_STYLE, style],
      },
      [...children, ...(slots.default?.() ?? [])],
    );
  };

  Icon.displayName = name;
  Icon.inheritAttrs = false;

  return Icon;
}
