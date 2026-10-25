import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import ZenExpandTransition from '@/core/components/ui/ZenExpandTransition.vue';

type Frames = Record<string, string | number>[];

// jsdom has no Web Animations: record what is asked, finish on demand
const calls: { frames: Frames; options: KeyframeAnimationOptions }[] = [];
const running: { onfinish: (() => void) | null; cancel: () => void }[] = [];

function installAnimate() {
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value(frames: Frames, options: KeyframeAnimationOptions) {
      calls.push({ frames, options });
      const animation = {
        onfinish: null as (() => void) | null,
        cancel: vi.fn(),
      };
      running.push(animation);

      return animation;
    },
  });
}

function host(open: ReturnType<typeof ref<boolean>>) {
  return mount(
    defineComponent({
      setup: () => () =>
        h(ZenExpandTransition, null, {
          default: () =>
            open.value
              ? h(
                  'div',
                  {
                    class: 'fold',
                    style: 'padding: 14px 0 4px; margin-top: 4px',
                  },
                  'x',
                )
              : null,
        }),
    }),
    { attachTo: document.body },
  );
}

describe('ZenExpandTransition', () => {
  afterEach(() => {
    calls.length = 0;
    running.length = 0;
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  it('opens its space from nothing: height, padding and margin together', async () => {
    installAnimate();
    const open = ref(false);
    const wrapper = host(open);
    open.value = true;
    await nextTick();

    const space = calls.find((call) => 'height' in call.frames[0]);
    expect(space?.frames[0]).toMatchObject({
      height: '0px',
      paddingTop: '0px',
      paddingBottom: '0px',
      marginTop: '0px',
    });
    expect(space?.frames[1]).toMatchObject({
      paddingTop: '14px',
      paddingBottom: '4px',
      marginTop: '4px',
    });
    // The content arrives once there is room for it
    const ink = calls.find((call) => 'opacity' in call.frames[0]);
    expect(Number(ink?.options.delay)).toBeGreaterThan(0);
    wrapper.unmount();
  });

  it('closes from where it is, faster than it opened', async () => {
    installAnimate();
    const open = ref(false);
    const wrapper = host(open);
    open.value = true;
    await nextTick();
    const opening = calls.find((call) => 'height' in call.frames[0])!;

    open.value = false;
    await nextTick();
    const closing = calls.findLast((call) => 'height' in call.frames[0])!;

    // Interrupted mid-way: the running animation is stopped, not finished
    expect(running[0].cancel).toHaveBeenCalled();
    expect(closing.frames.at(-1)).toMatchObject({ height: '0px' });
    expect(Number(closing.options.duration)).toBeLessThan(
      Number(opening.options.duration),
    );
    wrapper.unmount();
  });

  it('still opens and closes without Web Animations', async () => {
    const open = ref(false);
    const wrapper = host(open);
    open.value = true;
    await nextTick();
    expect(wrapper.find('.fold').exists()).toBeTruthy();
    open.value = false;
    await nextTick();
    await nextTick();
    expect(wrapper.find('.fold').exists()).toBeFalsy();
    wrapper.unmount();
  });
});
