import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PubSubService } from '../src/infrastructure/services/PubSubService';

describe('PubSubService', () => {
  it('exposes PubSub instance', () => {
    const svc = new PubSubService();
    expect(svc.instance).toBeDefined();
  });

  it('iterator returns an async iterable iterator', () => {
    const svc = new PubSubService();
    const iter = svc.iterator(['TEST_EVENT']);

    expect(typeof iter[Symbol.asyncIterator]).toBe('function');
    expect(typeof iter.next).toBe('function');
  });

  it('iterator works with string trigger', () => {
    const svc = new PubSubService();
    const iter = svc.iterator('SINGLE_EVENT');

    expect(typeof iter[Symbol.asyncIterator]).toBe('function');
  });

  it('iterator works with multiple triggers', () => {
    const svc = new PubSubService();
    const iter = svc.iterator(['EVENT_1', 'EVENT_2', 'EVENT_3']);

    expect(typeof iter[Symbol.asyncIterator]).toBe('function');
  });

  it('can create multiple iterators for different events', () => {
    const svc = new PubSubService();
    const iter1 = svc.iterator(['EVENT_A']);
    const iter2 = svc.iterator(['EVENT_B']);

    expect(iter1).not.toBe(iter2);
    expect(typeof iter1[Symbol.asyncIterator]).toBe('function');
    expect(typeof iter2[Symbol.asyncIterator]).toBe('function');
  });

  it('iterator self-references in Symbol.asyncIterator', () => {
    const svc = new PubSubService();
    const iter = svc.iterator(['TEST']);

    const selfRef = iter[Symbol.asyncIterator]();
    expect(selfRef).toBe(iter);
  });

  it('iterator has optional return method', () => {
    const svc = new PubSubService();
    const iter = svc.iterator(['TEST']);

    // return and throw are optional on AsyncIterableIterator
    if (iter.return) {
      expect(typeof iter.return).toBe('function');
    }
  });

  it('iterator has optional throw method', () => {
    const svc = new PubSubService();
    const iter = svc.iterator(['TEST']);

    if (iter.throw) {
      expect(typeof iter.throw).toBe('function');
    }
  });

  it('instance is a PubSub object with publish capability', () => {
    const svc = new PubSubService();
    expect(typeof svc.instance.publish).toBe('function');
  });

  it('instance can publish events', async () => {
    const svc = new PubSubService();
    // Publishing should not throw
    await expect(
      svc.instance.publish('TEST_EVENT', { data: 'test' }),
    ).resolves.not.toThrow();
  });
});

describe('PubSubService - edge cases', () => {
  it('iterator next method returns a promise', async () => {
    const svc = new PubSubService();
    const iter = svc.iterator(['TEST_EVENT']);

    // next() should return a promise (we can't wait for it to resolve as it would block)
    const nextResult = iter.next();
    expect(nextResult).toBeInstanceOf(Promise);
  });

  it('multiple PubSubService instances are independent', () => {
    const svc1 = new PubSubService();
    const svc2 = new PubSubService();

    expect(svc1.instance).not.toBe(svc2.instance);
  });

  it('iterator handles empty string trigger', () => {
    const svc = new PubSubService();
    const iter = svc.iterator('');

    expect(typeof iter[Symbol.asyncIterator]).toBe('function');
  });

  it('iterator handles array with empty string', () => {
    const svc = new PubSubService();
    const iter = svc.iterator(['']);

    expect(typeof iter[Symbol.asyncIterator]).toBe('function');
  });
});

describe('PubSubService - asyncIterator fallback', () => {
  it('uses asyncIterator fallback when asyncIterableIterator is not available', () => {
    const svc = new PubSubService();

    // Mock the pubSub to only have asyncIterator (not asyncIterableIterator)
    const mockNext = vi.fn().mockResolvedValue({ done: false, value: 'test' });
    const mockReturn = vi
      .fn()
      .mockResolvedValue({ done: true, value: undefined });
    const mockThrow = vi.fn().mockRejectedValue(new Error('test'));

    const mockAsyncIterator = {
      next: mockNext,
      return: mockReturn,
      throw: mockThrow,
    };

    // @ts-expect-error - accessing private property for testing
    svc.pubSub.asyncIterableIterator = undefined;
    // @ts-expect-error - accessing private property for testing
    svc.pubSub.asyncIterator = vi.fn(() => mockAsyncIterator);

    const iter = svc.iterator(['TEST_EVENT']);

    expect(typeof iter[Symbol.asyncIterator]).toBe('function');
    expect(typeof iter.next).toBe('function');
    expect(iter[Symbol.asyncIterator]()).toBe(iter);
  });

  it('fallback iterator binds next method correctly', async () => {
    const svc = new PubSubService();

    const mockNext = vi
      .fn()
      .mockResolvedValue({ done: false, value: { data: 'test' } });
    const mockAsyncIterator = {
      next: mockNext,
      return: undefined,
      throw: undefined,
    };

    // @ts-expect-error - accessing private property for testing
    svc.pubSub.asyncIterableIterator = undefined;
    // @ts-expect-error - accessing private property for testing
    svc.pubSub.asyncIterator = vi.fn(() => mockAsyncIterator);

    const iter = svc.iterator(['TEST']);
    const result = iter.next();

    expect(result).toBeInstanceOf(Promise);
  });

  it('fallback iterator has return and throw methods when available', () => {
    const svc = new PubSubService();

    const mockReturn = vi
      .fn()
      .mockResolvedValue({ done: true, value: undefined });
    const mockThrow = vi.fn().mockRejectedValue(new Error('test'));
    const mockAsyncIterator = {
      next: vi.fn(),
      return: mockReturn,
      throw: mockThrow,
    };

    // @ts-expect-error - accessing private property for testing
    svc.pubSub.asyncIterableIterator = undefined;
    // @ts-expect-error - accessing private property for testing
    svc.pubSub.asyncIterator = vi.fn(() => mockAsyncIterator);

    const iter = svc.iterator(['TEST']);

    expect(iter.return).toBeDefined();
    expect(iter.throw).toBeDefined();
  });

  it('throws error when no async iterator method is available', () => {
    const svc = new PubSubService();

    // @ts-expect-error - accessing private property for testing
    svc.pubSub.asyncIterableIterator = undefined;
    // @ts-expect-error - accessing private property for testing
    svc.pubSub.asyncIterator = undefined;

    expect(() => svc.iterator(['TEST'])).toThrow(
      'PubSub does not expose an async iterator method',
    );
  });
});
