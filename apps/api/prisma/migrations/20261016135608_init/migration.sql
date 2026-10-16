-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'CNG', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "AccidentHistory" AS ENUM ('NO', 'MINOR', 'MAJOR');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('COMPREHENSIVE', 'THIRD_PARTY', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ContactRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RejectionReason" AS ENUM ('NO_LONGER_AVAILABLE', 'NOT_COMFORTABLE_SHARING', 'SUSPECTED_SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "CancellationSource" AS ENUM ('BUYER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'REMOVED');

-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONTACT_REQUEST_RECEIVED', 'CONTACT_REQUEST_APPROVED', 'CONTACT_REQUEST_REJECTED', 'LISTING_REMOVED_BY_ADMIN', 'LISTING_RESTORED_BY_ADMIN', 'ACCOUNT_SUSPENDED', 'ACCOUNT_UNSUSPENDED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('FAKE', 'SUSPECTED_SCAM', 'INCORRECT_INFORMATION', 'DUPLICATE', 'ALREADY_SOLD', 'INAPPROPRIATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'DEALER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('WEB', 'MOBILE');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateTable
CREATE TABLE "car_details" (
    "listing_id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "model_id" UUID NOT NULL,
    "variant_id" UUID,
    "variant_text" TEXT,
    "manufacturing_year" INTEGER NOT NULL,
    "fuel_type" "FuelType" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "km_driven" INTEGER NOT NULL,
    "number_of_owners" INTEGER NOT NULL,
    "registration_number" TEXT NOT NULL,
    "rto_code" TEXT NOT NULL,
    "accident_history" "AccidentHistory",
    "has_major_replacement" BOOLEAN,
    "replacement_details" TEXT,
    "colour" TEXT,
    "insurance_type" "InsuranceType",
    "insurance_valid_until" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_details_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_brands" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_key" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 100,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_models" (
    "id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_variants" (
    "id" UUID NOT NULL,
    "model_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "fuel_type" "FuelType",
    "transmission" "Transmission",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogue_sources" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogue_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_brand_external_refs" (
    "id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "external_id" TEXT NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_brand_external_refs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_model_external_refs" (
    "id" UUID NOT NULL,
    "model_id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "external_id" TEXT NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_model_external_refs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_variant_external_refs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "external_id" TEXT NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_variant_external_refs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "source_listing_id" UUID NOT NULL,
    "status" "ContactRequestStatus" NOT NULL DEFAULT 'PENDING',
    "allow_seller_to_contact" BOOLEAN NOT NULL,
    "rejection_reason" "RejectionReason",
    "rejection_note" TEXT,
    "cancellation_source" "CancellationSource",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_connections" (
    "id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "created_from_request_id" UUID NOT NULL,
    "seller_can_contact_buyer" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "district_id" UUID,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "price" INTEGER,
    "is_negotiable" BOOLEAN NOT NULL DEFAULT false,
    "search_text" TEXT,
    "published_at" TIMESTAMP(3),
    "sold_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),
    "removed_by_admin" BOOLEAN NOT NULL DEFAULT false,
    "removal_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "status" "ImageStatus" NOT NULL DEFAULT 'UPLOADING',
    "position" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "original_file_name" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_stats" (
    "listing_id" UUID NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "favourite_count" INTEGER NOT NULL DEFAULT 0,
    "contact_request_count" INTEGER NOT NULL DEFAULT 0,
    "contact_approval_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_stats_pkey" PRIMARY KEY ("listing_id")
);

-- CreateTable
CREATE TABLE "favourites" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" UUID NOT NULL,
    "state_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_reports" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_by_id" UUID,
    "resolution_note" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "account_type" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "district_id" UUID,
    "profile_image_key" TEXT,
    "default_allow_seller_contact" BOOLEAN NOT NULL DEFAULT false,
    "suspended_at" TIMESTAMP(3),
    "suspension_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_key" TEXT,
    "district_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "client_type" "ClientType" NOT NULL,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "device_identifier" TEXT NOT NULL,
    "push_token" TEXT NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "car_details_brand_id_model_id_idx" ON "car_details"("brand_id", "model_id");

-- CreateIndex
CREATE INDEX "car_details_manufacturing_year_idx" ON "car_details"("manufacturing_year");

-- CreateIndex
CREATE INDEX "car_details_km_driven_idx" ON "car_details"("km_driven");

-- CreateIndex
CREATE INDEX "car_details_fuel_type_transmission_idx" ON "car_details"("fuel_type", "transmission");

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_brands_slug_key" ON "vehicle_brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_models_brand_id_slug_key" ON "vehicle_models"("brand_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_variants_model_id_name_key" ON "vehicle_variants"("model_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "catalogue_sources_code_key" ON "catalogue_sources"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_brand_external_refs_source_id_external_id_key" ON "vehicle_brand_external_refs"("source_id", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_model_external_refs_source_id_external_id_key" ON "vehicle_model_external_refs"("source_id", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_variant_external_refs_source_id_external_id_key" ON "vehicle_variant_external_refs"("source_id", "external_id");

-- CreateIndex
CREATE INDEX "contact_requests_seller_id_status_created_at_idx" ON "contact_requests"("seller_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "contact_requests_buyer_id_status_created_at_idx" ON "contact_requests"("buyer_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "contact_requests_buyer_id_seller_id_source_listing_id_creat_idx" ON "contact_requests"("buyer_id", "seller_id", "source_listing_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "contact_connections_created_from_request_id_key" ON "contact_connections"("created_from_request_id");

-- CreateIndex
CREATE INDEX "contact_connections_seller_id_idx" ON "contact_connections"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_connections_buyer_id_seller_id_key" ON "contact_connections"("buyer_id", "seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listings_status_published_at_idx" ON "listings"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "listings_status_price_idx" ON "listings"("status", "price");

-- CreateIndex
CREATE INDEX "listings_status_district_id_idx" ON "listings"("status", "district_id");

-- CreateIndex
CREATE INDEX "listings_seller_id_status_idx" ON "listings"("seller_id", "status");

-- CreateIndex
CREATE INDEX "listing_images_listing_id_position_idx" ON "listing_images"("listing_id", "position");

-- CreateIndex
CREATE INDEX "favourites_user_id_created_at_idx" ON "favourites"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "favourites_user_id_listing_id_key" ON "favourites"("user_id", "listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "states_code_key" ON "states"("code");

-- CreateIndex
CREATE UNIQUE INDEX "states_slug_key" ON "states"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "districts_slug_key" ON "districts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "districts_state_id_name_key" ON "districts"("state_id", "name");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "listing_reports_status_created_at_idx" ON "listing_reports"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "listing_reports_listing_id_idx" ON "listing_reports"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_profiles_user_id_key" ON "dealer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_profiles_slug_key" ON "dealer_profiles"("slug");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_devices_push_token_idx" ON "user_devices"("push_token");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_user_id_device_identifier_key" ON "user_devices"("user_id", "device_identifier");

-- AddForeignKey
ALTER TABLE "car_details" ADD CONSTRAINT "car_details_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_details" ADD CONSTRAINT "car_details_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_details" ADD CONSTRAINT "car_details_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "vehicle_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_details" ADD CONSTRAINT "car_details_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "vehicle_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_variants" ADD CONSTRAINT "vehicle_variants_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "vehicle_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_brand_external_refs" ADD CONSTRAINT "vehicle_brand_external_refs_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_brand_external_refs" ADD CONSTRAINT "vehicle_brand_external_refs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "catalogue_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_model_external_refs" ADD CONSTRAINT "vehicle_model_external_refs_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "vehicle_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_model_external_refs" ADD CONSTRAINT "vehicle_model_external_refs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "catalogue_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_variant_external_refs" ADD CONSTRAINT "vehicle_variant_external_refs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "vehicle_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_variant_external_refs" ADD CONSTRAINT "vehicle_variant_external_refs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "catalogue_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_source_listing_id_fkey" FOREIGN KEY ("source_listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_connections" ADD CONSTRAINT "contact_connections_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_connections" ADD CONSTRAINT "contact_connections_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_connections" ADD CONSTRAINT "contact_connections_created_from_request_id_fkey" FOREIGN KEY ("created_from_request_id") REFERENCES "contact_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_stats" ADD CONSTRAINT "listing_stats_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_profiles" ADD CONSTRAINT "dealer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_profiles" ADD CONSTRAINT "dealer_profiles_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
