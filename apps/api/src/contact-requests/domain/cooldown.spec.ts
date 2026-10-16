import { activeCooldownUntil, canRequestAgainAt } from './cooldown';

const at = (iso: string) => new Date(iso);
const base = { respondedAt: null, cancelledAt: null, cancellationSource: null };

describe('contact request cooldown', () => {
  it('starts four days after a rejection', () => {
    const request = {
      ...base,
      status: 'REJECTED' as const,
      respondedAt: at('2026-10-16T08:30:00Z'),
    };
    expect(canRequestAgainAt(request)).toEqual(at('2026-10-20T08:30:00Z'));
  });

  it('starts four days after a buyer cancellation', () => {
    const request = {
      ...base,
      status: 'CANCELLED' as const,
      cancelledAt: at('2026-10-16T00:00:00Z'),
      cancellationSource: 'BUYER' as const,
    };
    expect(canRequestAgainAt(request)).toEqual(at('2026-10-20T00:00:00Z'));
  });

  it('does not apply to system cancellations', () => {
    const request = {
      ...base,
      status: 'CANCELLED' as const,
      cancelledAt: at('2026-10-16T00:00:00Z'),
      cancellationSource: 'SYSTEM' as const,
    };
    expect(canRequestAgainAt(request)).toBeNull();
  });

  it('is only active while in the future', () => {
    const request = {
      ...base,
      status: 'REJECTED' as const,
      respondedAt: at('2026-10-16T00:00:00Z'),
    };
    expect(activeCooldownUntil(request, at('2026-10-19T23:59:59Z'))).not.toBeNull();
    expect(activeCooldownUntil(request, at('2026-10-20T00:00:01Z'))).toBeNull();
    expect(activeCooldownUntil(null)).toBeNull();
  });

  it('never applies to pending or approved requests', () => {
    expect(canRequestAgainAt({ ...base, status: 'PENDING' })).toBeNull();
    expect(canRequestAgainAt({ ...base, status: 'APPROVED', respondedAt: new Date() })).toBeNull();
  });
});
