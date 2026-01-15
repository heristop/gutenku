import { promises as fs } from 'node:fs';
import FormData from 'form-data';
import axios from 'axios';
import type { HaikuValue } from '~/shared/types';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('discord-bridge');

/**
 * Discord Bridge - Publishes haiku content to Discord via webhook
 */
export async function publishToDiscord(
  haiku: HaikuValue,
  caption: string,
): Promise<void> {
  if (!caption) {
    throw new Error('Caption cannot be empty');
  }

  if (!process.env.DISCORD_WEBHOOK_URL) {
    log.warn('Discord webhook URL not configured, skipping publish');

    return;
  }

  const imageBuffer = await fs.readFile(haiku.imagePath);
  const form = new FormData();

  const formattedTitle = haiku.title.replaceAll(/\s/g, '_').toLowerCase();
  form.append('file', imageBuffer, {
    contentType: 'image/jpeg',
    filename: `${formattedTitle}.jpg`,
    knownLength: imageBuffer.length,
  });

  form.append('content', caption);

  const formHeaders = form.getHeaders();

  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, form, {
      headers: formHeaders,
    });

    log.info('Message posted to Discord successfully');
  } catch (error) {
    log.error({ err: error }, 'Failed to send message to Discord');
    throw error;
  }
}
