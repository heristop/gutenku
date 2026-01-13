import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { post, generateSocialCaption } from '../src/application/services/SocialService';
import { publishToDiscord } from '../src/application/services/bridges/DiscordBridge';
import axios from 'axios';
import { promises as fs } from 'node:fs';
import type { HaikuValue } from '@gutenku/shared';

vi.mock('axios');
vi.mock('node:fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}));

const createMockHaiku = (overrides?: Partial<HaikuValue>): HaikuValue => ({
  title: 'Pride and Prejudice',
  book: {
    reference: '1234',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
  },
  chapter: { content: 'Chapter content' },
  verses: ['first verse five', 'second verse seven syl', 'third verse five'],
  rawVerses: ['first verse five', 'second verse seven syl', 'third verse five'],
  imagePath: '/tmp/test-image.jpg',
  cacheUsed: false,
  ...overrides,
});

describe('SocialService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    delete process.env.DISCORD_WEBHOOK_URL;
    delete process.env.DISCORD_HASHTAGS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('post', () => {
    it('throws error when title is null', async () => {
      const haiku = createMockHaiku({ title: null as unknown as string });

      await expect(post(haiku)).rejects.toThrow('Missing Title');
    });

    it('does not publish when Discord webhook not configured', async () => {
      const haiku = createMockHaiku();

      await post(haiku);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('publishes to Discord when webhook configured', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/webhook/test';
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-image'));
      vi.mocked(axios.post).mockResolvedValue({ status: 200 });

      const haiku = createMockHaiku();
      await post(haiku);

      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('uses extraHashtags from options', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/webhook/test';
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-image'));
      vi.mocked(axios.post).mockResolvedValue({ status: 200 });

      const haiku = createMockHaiku();
      await post(haiku, { extraHashtags: '#poetry' });

      expect(axios.post).toHaveBeenCalled();
    });

    it('uses DISCORD_HASHTAGS env when no options', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/webhook/test';
      process.env.DISCORD_HASHTAGS = '#literature';
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-image'));
      vi.mocked(axios.post).mockResolvedValue({ status: 200 });

      const haiku = createMockHaiku();
      await post(haiku);

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('generateSocialCaption', () => {
    it('exports generateSocialCaption from shared', () => {
      expect(typeof generateSocialCaption).toBe('function');
    });
  });
});

describe('DiscordBridge', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    delete process.env.DISCORD_WEBHOOK_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('publishToDiscord', () => {
    it('throws error when caption is empty', async () => {
      const haiku = createMockHaiku();

      await expect(publishToDiscord(haiku, '')).rejects.toThrow(
        'Caption cannot be empty',
      );
    });

    it('returns early when webhook not configured', async () => {
      const haiku = createMockHaiku();

      await publishToDiscord(haiku, 'Test caption');

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('posts to Discord webhook with form data', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/webhook/test';
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-image'));
      vi.mocked(axios.post).mockResolvedValue({ status: 200 });

      const haiku = createMockHaiku();
      await publishToDiscord(haiku, 'Test caption');

      expect(axios.post).toHaveBeenCalledWith(
        'https://discord.com/webhook/test',
        expect.any(Object),
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
    });

    it('formats filename from title', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/webhook/test';
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-image'));
      vi.mocked(axios.post).mockResolvedValue({ status: 200 });

      const haiku = createMockHaiku({ title: 'Pride And Prejudice' });
      await publishToDiscord(haiku, 'Test caption');

      expect(axios.post).toHaveBeenCalled();
    });

    it('throws error when axios fails', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/webhook/test';
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-image'));
      vi.mocked(axios.post).mockRejectedValue(new Error('Network error'));

      const haiku = createMockHaiku();

      await expect(publishToDiscord(haiku, 'Test caption')).rejects.toThrow(
        'Network error',
      );
    });

    it('handles titles with special whitespace', async () => {
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/webhook/test';
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('fake-image'));
      vi.mocked(axios.post).mockResolvedValue({ status: 200 });

      const haiku = createMockHaiku({ title: 'Pride\tAnd\nPrejudice' });
      await publishToDiscord(haiku, 'Test caption');

      expect(axios.post).toHaveBeenCalled();
    });
  });
});
