-- workers/core/schema.sql
-- ============================================================================
-- NATIVEPLANR RELATIONAL EDGE CORE LAYER (CLOUDFLARE D1 / SQLITE)
-- ============================================================================

-- 1. Identity Registry Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 2. User Inventory Asset Ledger (Owned Plants)
CREATE TABLE IF NOT EXISTS user_inventory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plant_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. User Wishlist Ledger (Target Plants)
CREATE TABLE IF NOT EXISTS user_wishlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plant_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Affiliate External Product Lookup Index (Stub Layer)
CREATE TABLE IF NOT EXISTS affiliate_products (
    plant_id TEXT PRIMARY KEY,
    affiliate_url TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    last_updated INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 5. Location Reference Matrix for Programmatic SEO Support
CREATE TABLE IF NOT EXISTS locations (
    zip_code TEXT PRIMARY KEY,
    county_name TEXT NOT NULL,
    state_code TEXT NOT NULL
);

-- ============================================================================
-- INDEXES FOR TENANT ISOLATION BOUNDARIES & PERFORMANCE TUNING
-- ============================================================================
-- These indexes convert heavy database table scans into localized micro-lookups, 
-- ensuring multi-tenant queries stay isolated and fast.
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_geo ON locations(county_name, state_code);
