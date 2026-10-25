import { afterAll, vi } from 'vitest';
import { config } from '@vue/test-utils';

// Mock import.meta.env
vi.stubGlobal('import.meta.env', {
  SSR: false,
  DEV: true,
  PROD: false,
  MODE: 'test',
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

// Mock matchMedia
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

// Mock requestAnimationFrame. Pending frames are dropped when a file ends,
// so a transition left mid-flight never runs after jsdom is torn down.
const pendingFrames = new Set<ReturnType<typeof setTimeout>>();

vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  const id = setTimeout(() => {
    pendingFrames.delete(id);

    if ('window' in globalThis) {
      cb(performance.now());
    }
  }, 16);
  pendingFrames.add(id);

  return id;
});
vi.stubGlobal('cancelAnimationFrame', (id: ReturnType<typeof setTimeout>) => {
  pendingFrames.delete(id);
  clearTimeout(id);
});

afterAll(() => {
  pendingFrames.forEach((id) => clearTimeout(id));
  pendingFrames.clear();
});

// Mock performance.now
if (typeof performance === 'undefined') {
  vi.stubGlobal('performance', {
    now: vi.fn(() => Date.now()),
  });
}

// Mock IntersectionObserver
vi.stubGlobal(
  'IntersectionObserver',
  vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
);

// Mock ResizeObserver
vi.stubGlobal(
  'ResizeObserver',
  vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
);

// Mock navigator.clipboard
vi.stubGlobal('navigator', {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(),
    readText: vi.fn().mockResolvedValue(''),
  },
  share: vi.fn().mockResolvedValue(),
  canShare: vi.fn().mockReturnValue(true),
  vibrate: vi.fn().mockReturnValue(true),
  userAgent: 'vitest',
});

// Mock Audio
vi.stubGlobal(
  'Audio',
  vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(),
    pause: vi.fn(),
    load: vi.fn(),
    currentTime: 0,
    volume: 1,
    preload: 'auto',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

// Vue test utils global config
config.global.stubs = {
  teleport: true,
  transition: false,
};

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});
