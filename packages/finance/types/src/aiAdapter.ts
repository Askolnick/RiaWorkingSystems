/*
 * Mock AI adapter for classification and posting suggestions.
 *
 * In production, replace this implementation with a call to your
 * chosen large language model (e.g. DeepSeek).  The function takes a
 * normalised event, chart of accounts and tax rules and returns a
 * balanced set of journal lines along with a confidence score and
 * rationale.  The caller is responsible for validating the result
 * before posting to the ledger.
 */
import type { Account, JournalLine } from '@prisma/client';

export interface AISuggestionResult {
  lines: Array<{ accountCode: string; debitCents: number; creditCents: number; taxCode?: string }>;
  rationale: string;
  confidence: number;
}

interface NormalisedEvent {
  type: string;
  currency: string;
  amountCents: number;
  date: string;
  description: string;
  meta?: Record<string, any>;
}

/**
 * Suggest a posting for a normalised event using a mock AI model.
 *
 * @param event Normalised event data
 * @param chart List of accounts available to the model
 * @returns An AI suggestion result with lines, rationale and confidence
 */
export async function suggestPosting(event: NormalisedEvent, chart: Account[]): Promise<AISuggestionResult> {
  // This mock implementation simply classifies taxi rides as travel
  const taxiKeywords = ['uber', 'lyft', 'taxi', 'cab'];
  const lowerDesc = event.description.toLowerCase();
  const isTaxi = taxiKeywords.some(k => lowerDesc.includes(k));
  const bankAccount = chart.find(a => a.code === '5720')!;
  if (isTaxi) {
    const travelAccount = chart.find(a => a.code === '6270');
    if (!travelAccount) {
      throw new Error('Missing travel account 6270');
    }
    return {
      lines: [
        { accountCode: travelAccount.code, debitCents: Math.abs(event.amountCents), creditCents: 0 },
        { accountCode: bankAccount.code, debitCents: 0, creditCents: Math.abs(event.amountCents) }
      ],
      rationale: 'Classified as a travel expense based on description',
      confidence: 0.9
    };
  }
  // fallback: post to an uncategorised expense account (e.g. 6990)
  const misc = chart.find(a => a.code === '6990');
  if (!misc) {
    throw new Error('Missing default expense account 6990');
  }
  return {
    lines: [
      { accountCode: misc.code, debitCents: Math.abs(event.amountCents), creditCents: 0 },
      { accountCode: bankAccount.code, debitCents: 0, creditCents: Math.abs(event.amountCents) }
    ],
    rationale: 'Could not classify transaction, posted to miscellaneous',
    confidence: 0.5
  };
}