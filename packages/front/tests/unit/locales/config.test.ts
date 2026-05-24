import { describe, it, expect } from 'vitest';
import {
  SITE_URL,
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from '@/locales/config';

describe('locales config', () => {
  it('exposes a site url', () => {
    expect(typeof SITE_URL).toBe('string');
    expect(SITE_URL.length).toBeGreaterThan(0);
  });

  it('lists the supported locales derived from config', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'fr', 'ja']);
    
for (const loc of SUPPORTED_LOCALES) {
      expect(LOCALE_CONFIG[loc]).toBeDefined();
      expect(LOCALE_CONFIG[loc].htmlLang).toBeTruthy();
      expect(LOCALE_CONFIG[loc].ogLocale).toContain('_');
      expect(Array.isArray(LOCALE_CONFIG[loc].browserCodes)).toBeTruthy();
    }
  });

  it('defaults to english', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });
});
