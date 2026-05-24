import { defineComponent, h } from 'vue';

// Brand icons (Apple, Github, Instagram, Linkedin, Twitter) with the same
// `size` / `strokeWidth` props and `currentColor` stroke as @lucide/vue icons.

interface IconProps {
  size?: number | string;
  strokeWidth?: number | string;
}

function iconAttrs(
  size: IconProps['size'],
  strokeWidth: IconProps['strokeWidth'],
) {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size ?? 24,
    height: size ?? 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': strokeWidth ?? 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  };
}

const iconProps = {
  size: { type: [Number, String], default: 24 },
  strokeWidth: { type: [Number, String], default: 2 },
} as never;

export const Apple = defineComponent<IconProps>({
  name: 'Apple',
  props: iconProps,
  setup(props) {
    return () =>
      h('svg', iconAttrs(props.size, props.strokeWidth), [
        h('path', {
          d: 'M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z',
        }),
        h('path', { d: 'M10 2c1 .5 2 2 2 5' }),
      ]);
  },
});

export const Github = defineComponent<IconProps>({
  name: 'Github',
  props: iconProps,
  setup(props) {
    return () =>
      h('svg', iconAttrs(props.size, props.strokeWidth), [
        h('path', {
          d: 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4',
        }),
        h('path', { d: 'M9 18c-4.51 2-5-2-7-2' }),
      ]);
  },
});

export const Instagram = defineComponent<IconProps>({
  name: 'Instagram',
  props: iconProps,
  setup(props) {
    return () =>
      h('svg', iconAttrs(props.size, props.strokeWidth), [
        h('rect', { width: 20, height: 20, x: 2, y: 2, rx: 5, ry: 5 }),
        h('path', {
          d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z',
        }),
        h('line', { x1: 17.5, x2: 17.51, y1: 6.5, y2: 6.5 }),
      ]);
  },
});

export const Linkedin = defineComponent<IconProps>({
  name: 'Linkedin',
  props: iconProps,
  setup(props) {
    return () =>
      h('svg', iconAttrs(props.size, props.strokeWidth), [
        h('path', {
          d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
        }),
        h('rect', { width: 4, height: 12, x: 2, y: 9 }),
        h('circle', { cx: 4, cy: 4, r: 2 }),
      ]);
  },
});

export const Twitter = defineComponent<IconProps>({
  name: 'Twitter',
  props: iconProps,
  setup(props) {
    return () =>
      h('svg', iconAttrs(props.size, props.strokeWidth), [
        h('path', {
          d: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z',
        }),
      ]);
  },
});
