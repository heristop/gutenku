import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { useTableOfContents } from '@/features/blog/composables/table-of-contents';
import type { TocHeading } from '@/features/blog/composables/article-toc';

const VIEWPORT = 1000;

class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  disconnect = vi.fn();

  constructor(
    public callback: () => void,
    public options: IntersectionObserverInit,
  ) {
    FakeObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.push(el);
  }
}

let frames = new Map<number, FrameRequestCallback>();
let frameId = 0;

function runFrames() {
  const pending = [...frames.values()];

  frames.clear();

  for (const cb of pending) {
    cb(0);
  }
}

function setScroll(scrollY: number, scrollHeight: number) {
  vi.stubGlobal('scrollY', scrollY);
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
}

function rectAt(top: number, height = 0) {
  return vi.fn(() => ({ top, height }) as DOMRect);
}

function makeBody(ids: string[], tops: number[] = []) {
  const body = document.createElement('div');

  ids.forEach((id, index) => {
    const el = document.createElement('h2');

    el.id = id;
    el.focus = vi.fn();
    el.scrollIntoView = vi.fn();
    el.getBoundingClientRect = rectAt(tops[index] ?? 0);
    body.append(el);
  });

  body.getBoundingClientRect = rectAt(-200, 2000);

  return body;
}

function headingsFor(ids: string[]): TocHeading[] {
  return ids.map((id) => ({ id, text: id, level: 2 as const }));
}

function el(body: HTMLElement, id: string) {
  return body.querySelector<HTMLElement>(`[id="${id}"]`) as HTMLElement;
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
}

let wrapper: VueWrapper | null = null;

async function setup(
  headings: Ref<TocHeading[]>,
  body: Ref<HTMLElement | null>,
) {
  let result!: ReturnType<typeof useTableOfContents>;

  wrapper = mount(
    defineComponent({
      setup() {
        result = useTableOfContents(headings, body);

        return () => h('div');
      },
    }),
  );
  await flushPromises();

  return result;
}

describe('useTableOfContents', () => {
  beforeEach(() => {
    FakeObserver.instances = [];
    frames = new Map();
    frameId = 0;
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frameId += 1;
      frames.set(frameId, cb);

      return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames.delete(id);
    });
    vi.stubGlobal('CSS', {
      escape: (value: string) => value.replaceAll(/([^\w-])/g, '\\$1'),
    });
    vi.stubGlobal('innerHeight', VIEWPORT);
    setScroll(0, 5000);
    stubReducedMotion(false);
    globalThis.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('setup', () => {
    it('stays idle without headings', async () => {
      const body = ref<HTMLElement | null>(makeBody(['a']));
      const toc = await setup(ref([]), body);

      expect(toc.activeId.value).toBeNull();
      expect(toc.progress.value).toBe(0);
      expect(FakeObserver.instances).toHaveLength(0);
      expect(frames.size).toBe(0);
    });

    it('stays idle without a body', async () => {
      const toc = await setup(ref(headingsFor(['a'])), ref(null));

      expect(toc.activeId.value).toBeNull();
      expect(toc.progress.value).toBe(0);
      expect(FakeObserver.instances).toHaveLength(0);
    });

    it('makes found headings script-focusable and observes them', async () => {
      const body = makeBody(['a', 'b']);

      await setup(ref(headingsFor(['a', 'missing', 'b'])), ref(body));

      expect(el(body, 'a').tabIndex).toBe(-1);
      expect(el(body, 'b').tabIndex).toBe(-1);
      expect(FakeObserver.instances).toHaveLength(1);
      expect(FakeObserver.instances[0].observed).toEqual([
        el(body, 'a'),
        el(body, 'b'),
      ]);
      expect(FakeObserver.instances[0].options.rootMargin).toBe(
        '-30% 0px -70% 0px',
      );
    });

    it('escapes ids that are not valid selectors', async () => {
      const body = document.createElement('div');
      const odd = document.createElement('h2');

      odd.id = 'odd:id.x';
      body.append(odd);

      await setup(ref(headingsFor(['odd:id.x'])), ref(body));

      expect(odd.tabIndex).toBe(-1);
    });

    it('measures once on setup', async () => {
      const body = makeBody(['a', 'b'], [-100, 600]);
      const toc = await setup(ref(headingsFor(['a', 'b'])), ref(body));

      expect(frames.size).toBe(1);

      runFrames();

      expect(toc.activeId.value).toBe('a');
    });

    it('re-runs the spy when the observer fires', async () => {
      const body = makeBody(['a', 'b'], [-100, 100]);
      const toc = await setup(ref(headingsFor(['a', 'b'])), ref(body));

      runFrames();

      expect(toc.activeId.value).toBe('b');

      el(body, 'b').getBoundingClientRect = rectAt(600);
      FakeObserver.instances[0].callback();
      runFrames();

      expect(toc.activeId.value).toBe('a');
    });
  });

  describe('measuring', () => {
    it('reports reading progress through the body', async () => {
      const body = makeBody(['a'], [-100]);
      const toc = await setup(ref(headingsFor(['a'])), ref(body));

      runFrames();

      // (300 - -200) / 2000
      expect(toc.progress.value).toBeCloseTo(0.25);
    });

    it('has no active section before the first heading', async () => {
      const body = makeBody(['a', 'b'], [500, 900]);
      const toc = await setup(ref(headingsFor(['a', 'b'])), ref(body));

      runFrames();

      expect(toc.activeId.value).toBeNull();
    });

    it('picks the last section crossed by the reading line', async () => {
      const body = makeBody(['a', 'b', 'c'], [-500, 200, 800]);
      const toc = await setup(ref(headingsFor(['a', 'b', 'c'])), ref(body));

      runFrames();

      expect(toc.activeId.value).toBe('b');
    });

    it('selects the last section at the very end of the page', async () => {
      setScroll(4000, 5000);

      const body = makeBody(['a', 'b'], [-500, 800]);
      const toc = await setup(ref(headingsFor(['a', 'b'])), ref(body));

      runFrames();

      expect(toc.activeId.value).toBe('b');
    });

    it('measures on scroll and resize, coalesced into one frame', async () => {
      const body = makeBody(['a']);

      await setup(ref(headingsFor(['a'])), ref(body));
      runFrames();

      expect(frames.size).toBe(0);

      globalThis.dispatchEvent(new Event('scroll'));
      globalThis.dispatchEvent(new Event('scroll'));
      globalThis.dispatchEvent(new Event('resize'));

      expect(frames.size).toBe(1);
    });

    it('skips measuring when the body disappears before the frame', async () => {
      const body = ref<HTMLElement | null>(makeBody(['a'], [-100]));
      const toc = await setup(ref(headingsFor(['a'])), body);

      runFrames();
      toc.progress.value = 0.5;
      body.value = null;
      globalThis.dispatchEvent(new Event('scroll'));
      runFrames();

      expect(toc.progress.value).toBe(0.5);
    });
  });

  describe('reacting to changes', () => {
    it('rebuilds when the headings change', async () => {
      const headings = ref(headingsFor(['a']));
      const body = makeBody(['a', 'b'], [-100, -50]);
      const toc = await setup(headings, ref(body));

      runFrames();

      expect(toc.activeId.value).toBe('a');

      headings.value = headingsFor(['a', 'b']);
      await flushPromises();

      expect(FakeObserver.instances).toHaveLength(2);
      expect(FakeObserver.instances[0].disconnect).toHaveBeenCalled();
      expect(FakeObserver.instances[1].observed).toHaveLength(2);

      runFrames();

      expect(toc.activeId.value).toBe('b');
    });

    it('drops the pending frame of the previous setup', async () => {
      const headings = ref(headingsFor(['a']));
      const body = makeBody(['a']);

      await setup(headings, ref(body));

      const before = [...frames.keys()];

      headings.value = headingsFor(['a']);
      await flushPromises();

      expect(before.every((id) => !frames.has(id))).toBeTruthy();
      expect(frames.size).toBe(1);
    });

    it('resets when the headings are emptied', async () => {
      const headings = ref(headingsFor(['a']));
      const toc = await setup(headings, ref(makeBody(['a'], [-100])));

      runFrames();

      expect(toc.activeId.value).toBe('a');

      headings.value = [];
      await flushPromises();

      expect(toc.activeId.value).toBeNull();
      expect(toc.progress.value).toBe(0);
    });

    it('waits for the body to exist', async () => {
      const body = ref<HTMLElement | null>(null);
      const toc = await setup(ref(headingsFor(['a'])), body);

      expect(FakeObserver.instances).toHaveLength(0);

      body.value = makeBody(['a'], [-100]);
      await flushPromises();
      runFrames();

      expect(toc.activeId.value).toBe('a');
    });
  });

  describe('shared section links', () => {
    it('scrolls to the section named in the hash', async () => {
      globalThis.history.replaceState(null, '', '/#b');

      const body = makeBody(['a', 'b']);

      await setup(ref(headingsFor(['a', 'b'])), ref(body));

      expect(el(body, 'b').scrollIntoView).toHaveBeenCalledWith({
        block: 'start',
      });
      expect(el(body, 'a').scrollIntoView).not.toHaveBeenCalled();
    });

    it('decodes an encoded hash', async () => {
      globalThis.history.replaceState(null, '', '/#caf%C3%A9');

      const body = makeBody(['café']);

      await setup(ref(headingsFor(['café'])), ref(body));

      expect(el(body, 'café').scrollIntoView).toHaveBeenCalled();
    });

    it('survives a malformed hash', async () => {
      globalThis.history.replaceState(null, '', '/#%E0%A4%A');

      const body = makeBody(['a']);

      await setup(ref(headingsFor(['a'])), ref(body));

      expect(el(body, 'a').scrollIntoView).not.toHaveBeenCalled();
    });

    it('does nothing when the hash matches no section', async () => {
      globalThis.history.replaceState(null, '', '/#elsewhere');

      const body = makeBody(['a']);

      await setup(ref(headingsFor(['a'])), ref(body));

      expect(el(body, 'a').scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('scrollToHeading', () => {
    it('ignores unknown sections', async () => {
      const replace = vi.spyOn(globalThis.history, 'replaceState');
      const toc = await setup(ref(headingsFor(['a'])), ref(makeBody(['a'])));

      replace.mockClear();
      toc.scrollToHeading('nope');

      expect(toc.activeId.value).toBeNull();
      expect(replace).not.toHaveBeenCalled();
    });

    it('focuses, smooth-scrolls and records the position', async () => {
      const replace = vi.spyOn(globalThis.history, 'replaceState');
      const body = makeBody(['a', 'b']);
      const toc = await setup(ref(headingsFor(['a', 'b'])), ref(body));

      toc.scrollToHeading('b');

      expect(toc.activeId.value).toBe('b');
      expect(el(body, 'b').focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(el(body, 'b').scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
      expect(replace).toHaveBeenLastCalledWith(
        globalThis.history.state,
        '',
        '#b',
      );
      expect(globalThis.location.hash).toBe('#b');
    });

    it('encodes the id in the hash', async () => {
      const body = makeBody(['a b']);
      const toc = await setup(ref(headingsFor(['a b'])), ref(body));

      toc.scrollToHeading('a b');

      expect(globalThis.location.hash).toBe('#a%20b');
    });

    it('jumps instead of gliding under reduced motion', async () => {
      stubReducedMotion(true);

      const body = makeBody(['a']);
      const toc = await setup(ref(headingsFor(['a'])), ref(body));

      toc.scrollToHeading('a');

      expect(el(body, 'a').scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
      });
    });

    it('glides when matchMedia is unavailable', async () => {
      vi.stubGlobal('matchMedia', null);

      const body = makeBody(['a']);
      const toc = await setup(ref(headingsFor(['a'])), ref(body));

      toc.scrollToHeading('a');

      expect(el(body, 'a').scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });
  });

  describe('scroll lock', () => {
    async function locked() {
      const body = makeBody(['a', 'b'], [-500, 800]);
      const toc = await setup(ref(headingsFor(['a', 'b'])), ref(body));

      runFrames();
      toc.scrollToHeading('b');

      return { body, toc };
    }

    it('holds the marker on the chosen entry while the page travels', async () => {
      const { toc } = await locked();

      globalThis.dispatchEvent(new Event('scroll'));
      runFrames();

      expect(toc.activeId.value).toBe('b');
      expect(toc.progress.value).toBeCloseTo(0.25);
    });

    it.each(['scrollend', 'wheel', 'touchstart', 'keydown'])(
      'hands control back on %s',
      async (type) => {
        const { toc } = await locked();

        globalThis.dispatchEvent(new Event(type));

        expect(frames.size).toBe(1);

        runFrames();

        expect(toc.activeId.value).toBe('a');
      },
    );

    it('releases itself after the fallback delay', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      const body = makeBody(['a', 'b'], [-500, 800]);
      const toc = await setup(ref(headingsFor(['a', 'b'])), ref(body));

      runFrames();
      toc.scrollToHeading('b');
      vi.advanceTimersByTime(1199);
      runFrames();

      expect(toc.activeId.value).toBe('b');

      vi.advanceTimersByTime(1);
      runFrames();

      expect(toc.activeId.value).toBe('a');
    });

    it('releases only once, however many inputs follow', async () => {
      const { toc } = await locked();

      globalThis.dispatchEvent(new Event('wheel'));
      globalThis.dispatchEvent(new Event('keydown'));
      globalThis.dispatchEvent(new Event('scrollend'));
      runFrames();

      expect(toc.activeId.value).toBe('a');
      expect(frames.size).toBe(0);
    });

    it('re-locks cleanly when another entry is chosen mid-travel', async () => {
      const { toc } = await locked();

      toc.scrollToHeading('a');
      globalThis.dispatchEvent(new Event('scroll'));
      runFrames();

      expect(toc.activeId.value).toBe('a');

      globalThis.dispatchEvent(new Event('scrollend'));
      runFrames();

      expect(toc.activeId.value).toBe('a');
    });
  });

  describe('unmounting', () => {
    it('disconnects, cancels the frame and stops listening', async () => {
      const toc = await setup(
        ref(headingsFor(['a'])),
        ref(makeBody(['a'], [-100])),
      );

      expect(frames.size).toBe(1);

      wrapper?.unmount();
      wrapper = null;

      expect(FakeObserver.instances[0].disconnect).toHaveBeenCalled();
      expect(frames.size).toBe(0);

      globalThis.dispatchEvent(new Event('scroll'));
      globalThis.dispatchEvent(new Event('resize'));

      expect(frames.size).toBe(0);
      expect(toc.activeId.value).toBeNull();
    });

    it('releases a held lock', async () => {
      const toc = await setup(
        ref(headingsFor(['a'])),
        ref(makeBody(['a'], [-100])),
      );
      const remove = vi.spyOn(globalThis, 'removeEventListener');

      toc.scrollToHeading('a');
      wrapper?.unmount();
      wrapper = null;

      const removed = remove.mock.calls.map(([type]) => type);

      expect(removed).toEqual(
        expect.arrayContaining(['scrollend', 'wheel', 'touchstart', 'keydown']),
      );
    });

    it('does not rebuild after a pending change once gone', async () => {
      const headings = ref(headingsFor(['a']));

      await setup(headings, ref(makeBody(['a'])));
      wrapper?.unmount();
      wrapper = null;
      headings.value = headingsFor(['a']);
      await nextTick();
      await flushPromises();

      expect(FakeObserver.instances.length).toBeLessThanOrEqual(2);
    });
  });
});
