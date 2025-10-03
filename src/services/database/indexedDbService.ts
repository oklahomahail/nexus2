// src/services/database/indexedDbService.ts
// Core IndexedDB service for persistent data storage

import { Campaign } from "@/models/campaign";
import type { _Donor } from "@/models/donor";
import { Client } from "@/services/clientService";

// Database configuration
const DB_NAME = "NexusDB";
const DB_VERSION = 1;

// Store names
export const STORES = {
  CLIENTS: "clients",
  CAMPAIGNS: "campaigns",
  DONORS: "donors",
  ANALYTICS: "analytics",
  SETTINGS: "settings",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

// Database schema and types
export interface DbSchema {
  [STORES.CLIENTS]: Client;
  [STORES.CAMPAIGNS]: Campaign;
  [STORES.DONORS]: _Donor;
  [STORES.ANALYTICS]: any; // Analytics data
  [STORES.SETTINGS]: any; // App settings
}

// Error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Main IndexedDB service class
class IndexedDbService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create clients store
        if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
          const clientStore = db.createObjectStore(STORES.CLIENTS, {
            keyPath: "id",
          });
          clientStore.createIndex("name", "name");
          clientStore.createIndex("createdAt", "createdAt");
        }

        // Create campaigns store
        if (!db.objectStoreNames.contains(STORES.CAMPAIGNS)) {
          const campaignStore = db.createObjectStore(STORES.CAMPAIGNS, {
            keyPath: "id",
          });
          campaignStore.createIndex("clientId", "clientId");
          campaignStore.createIndex("status", "status");
          campaignStore.createIndex("category", "category");
          campaignStore.createIndex("createdAt", "createdAt");
        }

        // Create donors store
        if (!db.objectStoreNames.contains(STORES.DONORS)) {
          const donorStore = db.createObjectStore(STORES.DONORS, {
            keyPath: "id",
          });
          donorStore.createIndex("email", "email", { unique: true });
          donorStore.createIndex("totalGiven", "totalGiven");
        }

        // Create analytics store
        if (!db.objectStoreNames.contains(STORES.ANALYTICS)) {
          db.createObjectStore(STORES.ANALYTICS, { keyPath: "id" });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;

        // Handle database errors
        this.db.onerror = (event) => {
          console.error("Database error:", event);
        };

        resolve();
      };

      request.onerror = () => {
        const error = new DatabaseError(
          `Failed to open database: ${request.error?.message || "Unknown error"}`,
          "DB_OPEN_ERROR",
        );
        reject(error);
      };

      request.onblocked = () => {
        console.warn("Database upgrade blocked. Please close other tabs.");
      };
    });

    return this.initPromise;
  }

  private async ensureDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new DatabaseError("Database not initialized", "DB_NOT_INITIALIZED");
    }
    return this.db;
  }

  // Generic CRUD operations
  async get<T extends keyof DbSchema>(
    storeName: T,
    id: string,
  ): Promise<DbSchema[T] | undefined> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(
          new DatabaseError(
            `Failed to get item: ${request.error?.message}`,
            "GET_ERROR",
          ),
        );
    });
  }

  async getAll<T extends keyof DbSchema>(
    storeName: T,
    indexName?: string,
    query?: IDBValidKey | IDBKeyRange,
  ): Promise<DbSchema[T][]> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      const request = query ? source.getAll(query) : source.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(
          new DatabaseError(
            `Failed to get all items: ${request.error?.message}`,
            "GETALL_ERROR",
          ),
        );
    });
  }

  async put<T extends keyof DbSchema>(
    storeName: T,
    item: DbSchema[T],
  ): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.put(item);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(
          new DatabaseError(
            `Failed to save item: ${transaction.error?.message}`,
            "PUT_ERROR",
          ),
        );
    });
  }

  async delete<T extends keyof DbSchema>(
    storeName: T,
    id: string,
  ): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.delete(id);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(
          new DatabaseError(
            `Failed to delete item: ${transaction.error?.message}`,
            "DELETE_ERROR",
          ),
        );
    });
  }

  async clear<T extends keyof DbSchema>(storeName: T): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      store.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(
          new DatabaseError(
            `Failed to clear store: ${transaction.error?.message}`,
            "CLEAR_ERROR",
          ),
        );
    });
  }

  // Bulk operations
  async putMany<T extends keyof DbSchema>(
    storeName: T,
    items: DbSchema[T][],
  ): Promise<void> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      for (const item of items) {
        store.put(item);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(
          new DatabaseError(
            `Failed to save items: ${transaction.error?.message}`,
            "PUTMANY_ERROR",
          ),
        );
    });
  }

  // Query operations
  async query<T extends keyof DbSchema>(
    storeName: T,
    indexName: string,
    query: IDBValidKey | IDBKeyRange,
    direction?: IDBCursorDirection,
  ): Promise<DbSchema[T][]> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const results: DbSchema[T][] = [];

      const request = index.openCursor(query, direction);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () =>
        reject(
          new DatabaseError(
            `Failed to query: ${request.error?.message}`,
            "QUERY_ERROR",
          ),
        );
    });
  }

  // Count operations
  async count<T extends keyof DbSchema>(
    storeName: T,
    indexName?: string,
    query?: IDBValidKey | IDBKeyRange,
  ): Promise<number> {
    const db = await this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      const request = query ? source.count(query) : source.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(
          new DatabaseError(
            `Failed to count items: ${request.error?.message}`,
            "COUNT_ERROR",
          ),
        );
    });
  }

  // Database management
  async exportData(): Promise<Record<StoreName, any[]>> {
    const data: Record<string, any[]> = {};

    for (const storeName of Object.values(STORES)) {
      data[storeName] = await this.getAll(storeName);
    }

    return data as Record<StoreName, any[]>;
  }

  async importData(data: Record<StoreName, any[]>): Promise<void> {
    for (const [storeName, items] of Object.entries(data)) {
      if (
        Object.values(STORES).includes(storeName as StoreName) &&
        Array.isArray(items)
      ) {
        await this.clear(storeName as StoreName);
        if (items.length > 0) {
          await this.putMany(storeName as StoreName, items);
        }
      }
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  // Get database info
  async getInfo(): Promise<{
    name: string;
    version: number;
    stores: string[];
    size?: number;
  }> {
    const db = await this.ensureDb();

    const info = {
      name: db.name,
      version: db.version,
      stores: Array.from(db.objectStoreNames),
    };

    // Try to get storage estimate (modern browsers)
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return { ...info, size: estimate.usage };
      } catch {
        // Ignore storage estimation errors
      }
    }

    return info;
  }
}

// Export singleton instance
export const indexedDbService = new IndexedDbService();

// Export convenience functions
export const initDatabase = () => indexedDbService.init();
export const closeDatabase = () => indexedDbService.close();
