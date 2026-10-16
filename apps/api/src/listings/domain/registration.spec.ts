import { formatRtoCode, normalizeRegistration } from './registration';

describe('normalizeRegistration', () => {
  it.each([
    ['KL 07 AB 1234', 'KL07AB1234', 'KL07'],
    ['kl-7-ab-1234', 'KL07AB1234', 'KL07'],
    ['KL01C5', 'KL01C5', 'KL01'],
    ['KL 65 1234', 'KL651234', 'KL65'],
    ['22 BH 1234 AA', '22BH1234AA', 'BH'],
  ])('normalises %s', (input, full, rtoCode) => {
    expect(normalizeRegistration(input)).toEqual({ full, rtoCode });
  });

  it.each(['', 'HELLO', 'KL00AB1234', 'KL07AB0000', '1234KL'])('rejects %s', (input) => {
    expect(normalizeRegistration(input)).toBeNull();
  });

  it('formats rto codes for display', () => {
    expect(formatRtoCode('KL07')).toBe('KL 07');
    expect(formatRtoCode('BH')).toBe('BH');
  });
});
