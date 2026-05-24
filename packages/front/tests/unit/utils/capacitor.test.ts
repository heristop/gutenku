import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('capacitor utils', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('reports web platform flags when Capacitor is on web', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => false,
        getPlatform: () => 'web',
      },
    }));

    const mod = await import('@/utils/capacitor');

    expect(mod.isNative).toBeFalsy();
    expect(mod.platform).toBe('web');
    expect(mod.isWeb).toBeTruthy();
    expect(mod.isIOS).toBeFalsy();
    expect(mod.isAndroid).toBeFalsy();
  });

  it('reports iOS native flags', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => true,
        getPlatform: () => 'ios',
      },
    }));

    const mod = await import('@/utils/capacitor');

    expect(mod.isNative).toBeTruthy();
    expect(mod.platform).toBe('ios');
    expect(mod.isIOS).toBeTruthy();
    expect(mod.isWeb).toBeFalsy();
  });

  it('reports Android flags', async () => {
    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => true,
        getPlatform: () => 'android',
      },
    }));

    const mod = await import('@/utils/capacitor');

    expect(mod.isAndroid).toBeTruthy();
    expect(mod.platform).toBe('android');
  });
});
