/** Client mirror of the API's RTO extraction, used only for the "what buyers see" preview. */
export function publicRtoPreview(input: string): string | null {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^\d{2}BH\d{4}[A-Z]{1,2}$/.test(compact)) return 'BH ••••••';
  const match = /^([A-Z]{2})(\d{1,2})[A-Z]{0,3}\d{1,4}$/.exec(compact);
  return match ? `${match[1]} ${match[2].padStart(2, '0')} ••••••` : null;
}
