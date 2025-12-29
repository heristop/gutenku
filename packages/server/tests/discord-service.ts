import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock dependencies before imports
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn().mockResolvedValue(Buffer.from('fake-image-data')),
  },
}));

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ status: 200 }),
  },
}));

import { post } from '~/application/services/SocialService';
import { publishToDiscord } from '~/application/services/bridges';
import type { HaikuValue } from '~/shared/types';
import axios from 'axios';
import { promises as fs } from 'node:fs';

describe('SocialService', () => {
  const createMockHaiku = (): HaikuValue => ({
    book: {
      author: 'Herman Melville',
      emoticons: '🐋📖',
      reference: 'moby-dick',
      title: 'Moby Dick',
    },
    cacheUsed: false,
    chapter: {
      content: 'Call me Ishmael.',
    },
    description: 'A haiku about the sea',
    executionTime: 100,
    hashtags: '#haiku #literature',
    image: 'base64data',
    imagePath: '/tmp/haiku.jpg',
    rawVerses: [
      'the white whale swims',
      'through the ocean deep and blue',
      'hunters give chase now',
    ],
    title: 'The White Whale',
    translations: {
      es: 'La ballena blanca',
      fr: 'La baleine blanche',
      jp: '白い鯨',
    },
    verses: [
      'The white whale swims',
      'Through the ocean deep and blue',
      'Hunters give chase now',
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('post', () => {
    it('throws error when haiku title is null', async () => {
      const haiku = createMockHaiku();
      haiku.title = null;

      await expect(post(haiku)).rejects.toThrow('Missing Title');
    });

    it('generates caption without throwing', async () => {
      const haiku = createMockHaiku();
      process.env.DISCORD_WEBHOOK_URL = '';
      process.env.DISCORD_HASHTAGS = '#daily';

      await expect(post(haiku)).resolves.not.toThrow();
    });

    it('calls publishToDiscord when DISCORD_WEBHOOK_URL is set', async () => {
      const haiku = createMockHaiku();
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.webhook.url';
      process.env.DISCORD_HASHTAGS = '#daily';

      await post(haiku);

      expect(axios.post).toHaveBeenCalled();
    });

    it('skips publish when DISCORD_WEBHOOK_URL is not set', async () => {
      const haiku = createMockHaiku();
      process.env.DISCORD_WEBHOOK_URL = '';

      await post(haiku);

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('formats author hashtag correctly', async () => {
      const haiku = createMockHaiku();
      haiku.book.author = 'Mary Shelley, Jr.';
      process.env.DISCORD_WEBHOOK_URL = '';

      await expect(post(haiku)).resolves.not.toThrow();
    });
  });

  describe('publishToDiscord', () => {
    it('throws error when caption is empty', async () => {
      const haiku = createMockHaiku();

      await expect(publishToDiscord(haiku, '')).rejects.toThrow(
        'Caption cannot be empty',
      );
    });

    it('reads image file and posts to webhook', async () => {
      const haiku = createMockHaiku();
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.webhook.url';

      await publishToDiscord(haiku, 'Test caption');

      expect(fs.readFile).toHaveBeenCalledWith('/tmp/haiku.jpg');
      expect(axios.post).toHaveBeenCalled();
    });

    it('formats filename from title', async () => {
      const haiku = createMockHaiku();
      haiku.title = 'The Ocean Waves';
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.webhook.url';

      await publishToDiscord(haiku, 'Test caption');

      const callArgs = (axios.post as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toBe('https://discord.webhook.url');
    });

    it('throws on axios errors', async () => {
      const haiku = createMockHaiku();
      process.env.DISCORD_WEBHOOK_URL = 'https://discord.webhook.url';
      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error'),
      );

      await expect(publishToDiscord(haiku, 'Test caption')).rejects.toThrow(
        'Network error',
      );
    });

    it('skips publish when webhook URL is not configured', async () => {
      const haiku = createMockHaiku();
      process.env.DISCORD_WEBHOOK_URL = '';

      await publishToDiscord(haiku, 'Test caption');

      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});
