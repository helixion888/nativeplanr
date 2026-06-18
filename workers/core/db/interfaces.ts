// workers/core/db/interfaces.ts
// ============================================================================
// NATIVEPLANR TYPE-SAFETY LAYER - PURE STRIPPED CONTRACT DATA ARCHITECTURES
// ============================================================================

/**
 * Core User Representation
 * Matches the 'users' database schema row.
 */
export interface UserRow {
  id: string;
  email: string;
  created_at: number; // Unix timestamp integer format
}

/**
 * User Inventory Asset Item Representation
 * Matches the 'user_inventory' database schema row.
 */
export interface InventoryRow {
  id: string;
  user_id: string;
  plant_id: string;
  quantity: number;
  created_at: number; // Unix timestamp integer format
}

/**
 * User Wishlist Asset Item Representation
 * Matches the 'user_wishlist' database schema row.
 */
export interface WishlistRow {
  id: string;
  user_id: string;
  plant_id: string;
  created_at: number; // Unix timestamp integer format
}

/**
 * External Monetized Affiliate Link Data Reference Stub
 * Matches the 'affiliate_products' database schema row.
 */
export interface AffiliateProductRow {
  plant_id: string;
  affiliate_url: string;
  provider_name: string;
  last_updated: number; // Unix timestamp integer format
}

/**
 * Location Data Coordinates Reference Mapping Structure
 * Matches the 'locations' database schema row.
 */
export interface LocationRow {
  zip_code: string;
  county_name: string;
  state_code: string;
}

/**
 * Structural Interface for standard Multi-Tenant CRUD Data Repositories.
 * Mandates explicit user isolating validation strings on every structural mutation.
 */
export interface IMultiTenantRepository<T> {
  getByUserId(userId: string): Promise<T[]>;
  create(userId: string, item: any): Promise<T>;
  update(userId: string, id: string, item: any): Promise<boolean>;
  delete(userId: string, id: string): Promise<boolean>;
}
