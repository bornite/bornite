import { z } from 'zod';

/**
 * Small library of reusable Zod schemas shared across value objects and entity
 * factories, so common invariants ("a non-empty, trimmed string") are expressed
 * once.
 */

/** A trimmed, non-empty string. */
export const nonEmptyString = z.string().trim().min(1, 'must not be empty');

/** An optional trimmed string that becomes `null` when absent or blank. */
export const optionalString = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullish()
  .transform((value) => value ?? null);
