-- Typo-tolerant listing search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX listing_search_trgm_idx
  ON listings USING GIN (search_text gin_trgm_ops)
  WHERE status = 'ACTIVE';

-- Catalogue selector search.
CREATE INDEX vehicle_brand_name_trgm_idx ON vehicle_brands USING GIN (name gin_trgm_ops);

-- Only one pending request per buyer + seller + source listing.
CREATE UNIQUE INDEX one_pending_request_per_listing
  ON contact_requests (buyer_id, seller_id, source_listing_id)
  WHERE status = 'PENDING';

-- One open report per reporter per listing.
CREATE UNIQUE INDEX one_open_report_per_reporter
  ON listing_reports (listing_id, reporter_id)
  WHERE status = 'OPEN';

-- Variant must be structured or free text.
ALTER TABLE car_details
  ADD CONSTRAINT car_details_variant_present
  CHECK (variant_id IS NOT NULL OR variant_text IS NOT NULL);

ALTER TABLE listings
  ADD CONSTRAINT listings_price_positive CHECK (price IS NULL OR price > 0);
