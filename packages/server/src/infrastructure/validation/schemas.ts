import { z } from 'zod';

/**
 * Validation schemas for GraphQL input parameters
 * Uses Zod v4 for runtime validation and type inference
 */

// Book filter validation (for search queries)
export const bookFilterSchema = z.object({
  filter: z
    .string()
    .max(100, 'Filter must be 100 characters or less')
    .optional()
    .nullable(),
});

export type BookFilterInput = z.infer<typeof bookFilterSchema>;

// Haiku generation validation
export const haikuQuerySchema = z.object({
  useAI: z.boolean().optional(),
  useCache: z.boolean().optional(),
  appendImg: z.boolean().optional(),
  useImageAI: z.boolean().optional(),
  selectionCount: z.number().int().min(1).max(20).optional(),
  theme: z.string().max(100).optional().nullable(),
  minSentimentScore: z.number().min(0).max(100).optional(),
  minMarkovScore: z.number().min(0).max(100).optional(),
  minPosScore: z.number().min(0).max(100).optional(),
  minTrigramScore: z.number().min(0).max(100).optional(),
  minTfidfScore: z.number().min(0).max(100).optional(),
  minPhoneticsScore: z.number().min(0).max(100).optional(),
});

export type HaikuQueryInput = z.infer<typeof haikuQuerySchema>;

// Daily puzzle validation
export const dailyPuzzleSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  revealedRounds: z
    .array(z.number().int().min(1).max(6))
    .optional()
    .default([]),
});

export type DailyPuzzleInput = z.infer<typeof dailyPuzzleSchema>;

// Submit guess validation
export const submitGuessSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  guessedBookId: z.string().min(1, 'Book ID is required'),
  currentRound: z.number().int().min(1).max(6),
});

export type SubmitGuessInput = z.infer<typeof submitGuessSchema>;

/**
 * Validate input and throw Zod error if invalid
 * Zod errors are automatically formatted with field-level messages
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
