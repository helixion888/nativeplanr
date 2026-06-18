// workers/core/db/repositories.ts
// ============================================================================
// NATIVEPLANR RELATIONAL DATA ACCESS LAYER (CLOUDFLARE D1 ENFORCEMENT ENGINE)
// ============================================================================

import { 
  IMultiTenantRepository, 
  UserRow, 
  InventoryRow, 
  WishlistRow, 
  LocationRow, 
  AffiliateProductRow 
} from './interfaces';

/**
 * Standard Cloudflare D1 Raw Query Prepared Execution Interface Binding
 */
interface D1Database {
  prepare(query: string): {
    bind(...values: any[]): {
      all<T>(): Promise<T[]>;
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
    };
  };
}

/**
 * 1. User Identity Registry Repository
 */
export class UserRepository {
  constructor(private db: D1Database) {}

  async getById(id: string): Promise<UserRow | null> {
    return await this.db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(id)
      .first<UserRow>();
  }

  async create(user: Omit<UserRow, 'created_at'>): Promise<UserRow> {
    const createdAt = Math.floor(Date.now() / 1000);
    await this.db
      .prepare("INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)")
      .bind(user.id, user.email, createdAt)
      .run();

    return { id: user.id, email: user.email, created_at: createdAt };
  }
}

/**
 * 2. Multi-Tenant User Inventory Repository
 * Securely scopes all mutations and reads by user_id natively.
 */
export class InventoryRepository implements IMultiTenantRepository<InventoryRow> {
  constructor(private db: D1Database) {}

  async getByUserId(userId: string): Promise<InventoryRow[]> {
    return await this.db
      .prepare("SELECT * FROM user_inventory WHERE user_id = ? ORDER BY created_at DESC")
      .bind(userId)
      .all<InventoryRow>();
  }

  async create(userId: string, item: { plant_id: string; quantity: number }): Promise<InventoryRow> {
    const id = crypto.randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);

    await this.db
      .prepare("INSERT INTO user_inventory (id, user_id, plant_id, quantity, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, userId, item.plant_id, item.quantity, createdAt)
      .run();

    return { id, user_id: userId, plant_id: item.plant_id, quantity: item.quantity, created_at: createdAt };
  }

  async update(userId: string, id: string, item: { quantity: number }): Promise<boolean> {
    const response = await this.db
      .prepare("UPDATE user_inventory SET quantity = ? WHERE id = ? AND user_id = ?")
      .bind(item.quantity, id, userId)
      .run();
    return response.success;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const response = await this.db
      .prepare("DELETE FROM user_inventory WHERE id = ? AND user_id = ?")
      .bind(id, userId)
      .run();
    return response.success;
  }
}

/**
 * 3. Multi-Tenant User Wishlist Repository
 * Securely scopes all mutations and reads by user_id natively.
 */
export class WishlistRepository implements IMultiTenantRepository<WishlistRow> {
  constructor(private db: D1Database) {}

  async getByUserId(userId: string): Promise<WishlistRow[]> {
    return await this.db
      .prepare("SELECT * FROM user_wishlist WHERE user_id = ? ORDER BY created_at DESC")
      .bind(userId)
      .all<WishlistRow>();
  }

  async create(userId: string, item: { plant_id: string }): Promise<WishlistRow> {
    const id = crypto.randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);

    await this.db
      .prepare("INSERT INTO user_wishlist (id, user_id, plant_id, created_at) VALUES (?, ?, ?, ?)")
      .bind(id, userId, item.plant_id, createdAt)
      .run();

    return { id, user_id: userId, plant_id: item.plant_id, created_at: createdAt };
  }

  async update(): Promise<boolean> {
    // Structural Rule: Wishlist rows are binary states (present/absent) and cannot be updated.
    return Promise.resolve(false);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const response = await this.db
      .prepare("DELETE FROM user_wishlist WHERE id = ? AND user_id = ?")
      .bind(id, userId)
      .run();
    return response.success;
  }
}

/**
 * 4. Location Metadata Directory Repository (Static Read-Only Matrix)
 */
export class LocationRepository {
  constructor(private db: D1Database) {}

  async getByZipCode(zipCode: string): Promise<LocationRow | null> {
    return await this.db
      .prepare("SELECT * FROM locations WHERE zip_code = ?")
      .bind(zipCode)
      .first<LocationRow>();
  }

  async getByCounty(countyName: string, stateCode: string): Promise<LocationRow[]> {
    return await this.db
      .prepare("SELECT * FROM locations WHERE county_name = ? AND state_code = ?")
      .bind(countyName, stateCode)
      .all<LocationRow>();
  }
}
