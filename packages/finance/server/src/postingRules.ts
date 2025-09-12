/*
 * Simple rules engine for automatically classifying transactions.
 *
 * Each rule has a `pattern` describing what to match (e.g. vendor names,
 * amounts, merchant category codes) and a `result` describing the
 * journal lines to create when the pattern matches.  Patterns and
 * results are stored as JSON in the `PostingPolicy` model.  This
 * module evaluates those patterns against a normalised event and
 * returns the first applicable result.
 */
import type { PostingPolicy } from '@prisma/client';

/**
 * Evaluate a list of posting policies against an event.
 *
 * @param policies Sorted list of active policies (highest priority first)
 * @param event Normalised event data (bank tx, invoice, bill, etc.)
 * @returns The matched policy or undefined if none match
 */
export function evaluatePolicies(policies: PostingPolicy[], event: Record<string, any>): PostingPolicy | undefined {
  for (const policy of policies) {
    const pattern = policy.pattern as Record<string, any>;
    let matches = true;
    for (const key of Object.keys(pattern)) {
      const expected = pattern[key];
      const actual = event[key];
      if (typeof expected === 'string' && typeof actual === 'string') {
        // simple substring match
        if (!actual.toLowerCase().includes(expected.toLowerCase())) {
          matches = false;
          break;
        }
      } else if (expected !== actual) {
        matches = false;
        break;
      }
    }
    if (matches) return policy;
  }
  return undefined;
}