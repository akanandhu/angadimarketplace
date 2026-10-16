import type { PostHog } from 'posthog-js';

export type AnalyticsEvent =
  | 'listing_viewed'
  | 'search_performed'
  | 'filter_applied'
  | 'listing_saved'
  | 'listing_shared'
  | 'contact_request_started'
  | 'contact_request_sent'
  | 'listing_creation_started'
  | 'listing_draft_saved'
  | 'listing_published'
  | 'listing_marked_sold';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let client: Promise<PostHog | null> | null = null;

function load(): Promise<PostHog | null> {
  if (!KEY || typeof window === 'undefined') return Promise.resolve(null);
  client ??= import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: 'history_change',
    });
    return posthog;
  });
  return client;
}

/** Behavioural analytics only — never used as product truth (that is ListingStats). */
export function track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  void load().then((posthog) => posthog?.capture(event, properties));
}

export function identify(userId: string) {
  void load().then((posthog) => posthog?.identify(userId));
}

export function resetAnalytics() {
  void load().then((posthog) => posthog?.reset());
}
