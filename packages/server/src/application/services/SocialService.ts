import type { HaikuValue } from '~/shared/types';
import { generateSocialCaption } from '@gutenku/shared';
import { createLogger } from '~/infrastructure/services/Logger';
import { publishToDiscord } from './bridges';

const log = createLogger('social');

export interface SocialPostOptions {
  extraHashtags?: string;
}

/**
 * Post haiku to configured social networks
 * Currently supports: Discord
 */
export async function post(haiku: HaikuValue, options?: SocialPostOptions) {
  if (haiku.title === null) {
    throw new Error('Missing Title');
  }

  const caption = generateSocialCaption(haiku, {
    extraHashtags: options?.extraHashtags || process.env.DISCORD_HASHTAGS,
  });

  log.debug({ caption }, 'Social caption prepared');

  // Publish to Discord if configured

  if (process.env.DISCORD_WEBHOOK_URL) {
    await publishToDiscord(haiku, caption);
  }

  // Future bridges can be added here:
  // if (process.env.TWITTER_API_KEY) {
  //   await publishToTwitter(haiku, caption);
  // }
}

export { generateSocialCaption };
