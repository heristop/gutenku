import { vi } from 'vitest';

// Ensure no real DB connections are attempted in tests
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('mongoose')>();
  return {
    ...actual,
    connect: vi.fn(async () => actual.connection),
  };
});
