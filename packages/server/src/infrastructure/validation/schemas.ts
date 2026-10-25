import { z } from 'zod';

/**
 * Validation schemas for GraphQL input parameters
 * Uses Zod v4 for runtime validation and type inference
 */

// Daily puzzle validation
export const dailyPuzzleSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  revealedRounds: z
    .array(z.number().int().min(1).max(6))
    .optional()
    .default([]),
  visibleEmoticonCount: z.number().int().min(0).max(100).optional(),
  revealedHaikuCount: z.number().int().min(0).max(3).optional(),
});

// Submit guess validation
export const submitGuessSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  guessedBookId: z.string().min(1, 'Book ID is required'),
  currentRound: z.number().int().min(1).max(6),
});
