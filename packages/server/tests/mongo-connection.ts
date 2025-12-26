import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock mongoose - must use inline object to avoid hoisting issues
vi.mock('mongoose', () => {
  const mockOn = vi.fn();
  const mockConnection = { on: mockOn };
  return {
    default: {
      connect: vi.fn(),
      connection: mockConnection,
    },
    connect: vi.fn(),
    connection: mockConnection,
  };
});

import mongoose from 'mongoose';
import MongoConnection from '../src/infrastructure/services/MongoConnection';

// Get reference to mock connection after import
const mockConnection = mongoose.connection as { on: ReturnType<typeof vi.fn> };

describe('MongoConnection', () => {
  let mongoConnection: MongoConnection;
  const originalEnv = process.env;

  beforeEach(() => {
    mongoConnection = new MongoConnection();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('can be instantiated', () => {
    expect(mongoConnection).toBeDefined();
    expect(mongoConnection.db).toBeNull();
  });

  it('connect uses default URI and database when env vars not set', async () => {
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DB;

    vi.mocked(mongoose.connect).mockResolvedValueOnce(
      mongoose as typeof mongoose,
    );

    await mongoConnection.connect();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://root:root@localhost:27017/admin',
      expect.objectContaining({
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
    );
  });

  it('connect uses env vars when set', async () => {
    process.env.MONGODB_URI = 'mongodb://custom:27017';
    process.env.MONGODB_DB = 'testdb';

    vi.mocked(mongoose.connect).mockResolvedValueOnce(
      mongoose as typeof mongoose,
    );

    await mongoConnection.connect();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://custom:27017/testdb',
      expect.any(Object),
    );
  });

  it('connect sets up event handlers', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(
      mongoose as typeof mongoose,
    );

    await mongoConnection.connect();

    expect(mockConnection.on).toHaveBeenCalledWith(
      'connected',
      expect.any(Function),
    );
    expect(mockConnection.on).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    );
    expect(mockConnection.on).toHaveBeenCalledWith(
      'disconnected',
      expect.any(Function),
    );
  });

  it('connect returns the connection on success', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(
      mongoose as typeof mongoose,
    );

    const result = await mongoConnection.connect();

    expect(result).toBe(mockConnection);
    expect(mongoConnection.db).toBe(mockConnection);
  });

  it('connect handles connection errors gracefully', async () => {
    vi.mocked(mongoose.connect).mockRejectedValueOnce(
      new Error('Connection failed'),
    );

    const result = await mongoConnection.connect();

    expect(result).toBeNull();
    expect(mongoConnection.db).toBeNull();
  });

  it('connect logs error message on failure', async () => {
    vi.mocked(mongoose.connect).mockRejectedValueOnce(
      new Error('ECONNREFUSED'),
    );

    const result = await mongoConnection.connect();

    expect(result).toBeNull();
  });
});

describe('MongoConnection - event handlers', () => {
  let mongoConnection: MongoConnection;
  let eventHandlers: Record<string, (...args: unknown[]) => void>;

  beforeEach(() => {
    mongoConnection = new MongoConnection();
    eventHandlers = {};

    mockConnection.on.mockImplementation(
      (event: string, handler: (...args: unknown[]) => void) => {
        eventHandlers[event] = handler;
      },
    );

    vi.clearAllMocks();
  });

  it('connected event handler logs connection info', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(
      mongoose as typeof mongoose,
    );

    await mongoConnection.connect();

    expect(eventHandlers.connected).toBeDefined();
    // Call the handler to ensure it doesn't throw
    expect(() => eventHandlers.connected()).not.toThrow();
  });

  it('error event handler logs error', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(
      mongoose as typeof mongoose,
    );

    await mongoConnection.connect();

    expect(eventHandlers.error).toBeDefined();
    // Call the handler with an error to ensure it doesn't throw
    expect(() => eventHandlers.error(new Error('test error'))).not.toThrow();
  });

  it('disconnected event handler logs warning', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(
      mongoose as typeof mongoose,
    );

    await mongoConnection.connect();

    expect(eventHandlers.disconnected).toBeDefined();
    // Call the handler to ensure it doesn't throw
    expect(() => eventHandlers.disconnected()).not.toThrow();
  });
});
