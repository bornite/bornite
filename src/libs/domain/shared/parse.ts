import { z } from 'zod';
import { InvalidArgumentError } from './domain-error';

/**
 * Parse/validate `input` against a Zod `schema`, translating any failure into a
 * domain {@link InvalidArgumentError}. This is the single bridge between Zod and
 * the domain's error contract: value objects and entity factories validate with
 * Zod but callers only ever see domain errors, never a `ZodError`, so the domain
 * stays free of library-specific leakage.
 */
export function parse<T>(schema: z.ZodType<T>, input: unknown, context?: string): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    throw new InvalidArgumentError(context ? `${context}: ${message}` : message);
  }
  return result.data;
}
