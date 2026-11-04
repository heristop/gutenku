import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import FilmPlate from '@/core/components/ink/FilmPlate.vue';

const props = {
  src: '/media/gutenguess-promo.mp4',
  poster: '/media/gutenguess-promo.webp',
  alt: 'How to play GutenGuess',
  playLabel: 'Play video',
};

describe('FilmPlate video discovery', () => {
  it('includes the video and its source in server-rendered HTML without interaction', async () => {
    const html = await renderToString(createSSRApp(FilmPlate, props));
    const document = new DOMParser().parseFromString(html, 'text/html');
    const video = document.querySelector('video');
    expect(video).not.toBeNull();
    expect(video?.getAttribute('src')).toBe(props.src);
    expect(video?.getAttribute('preload')).toBe('none');
    expect(video?.hasAttribute('autoplay')).toBeFalsy();
  });

  it('plays on request and retains the video element after playback ends', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue();
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});
    const wrapper = mount(FilmPlate, { props });
    const video = wrapper.get('video').element;
    await wrapper.get('button').trigger('click');
    expect(play).toHaveBeenCalledOnce();
    expect(wrapper.find('button').exists()).toBeFalsy();
    await wrapper.get('video').trigger('ended');
    expect(wrapper.get('video').element).toBe(video);
    expect(wrapper.find('button').exists()).toBeTruthy();
    wrapper.unmount();
    play.mockRestore();
    pause.mockRestore();
  });
});
