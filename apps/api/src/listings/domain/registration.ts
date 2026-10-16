export interface NormalizedRegistration {
  /** e.g. KL07AB1234 */
  full: string;
  /** Public RTO portion, e.g. KL07 (or BH for Bharat series). */
  rtoCode: string;
}

const STANDARD = /^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/;
const BHARAT = /^(\d{2})BH(\d{4})([A-Z]{1,2})$/;

/**
 * Normalises an Indian registration number ("KL 07 AB 1234" -> "KL07AB1234")
 * and derives its RTO code. Returns null when the format is not recognised.
 */
export function normalizeRegistration(input: string): NormalizedRegistration | null {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const bharat = BHARAT.exec(compact);
  if (bharat) return { full: compact, rtoCode: 'BH' };

  const standard = STANDARD.exec(compact);
  if (!standard) return null;
  const [, state, rto, series, number] = standard;
  if (Number(rto) === 0 || Number(number) === 0) return null;

  const paddedRto = rto.padStart(2, '0');
  return { full: `${state}${paddedRto}${series}${number}`, rtoCode: `${state}${paddedRto}` };
}

/** Display form of the public RTO code: "KL07" -> "KL 07". */
export function formatRtoCode(rtoCode: string): string {
  return rtoCode.replace(/^([A-Z]{2})(\d{2})$/, '$1 $2');
}
