/**
 * Normalises an Indian mobile number to E.164 (+91XXXXXXXXXX).
 * Returns null when the input is not a valid Indian mobile number.
 */
export function normalizeIndianPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return `+91${local}`;
}
