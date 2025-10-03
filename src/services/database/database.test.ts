// src/services/database/database.test.ts
// Basic tests for database operations

import FDBFactory from "fake-indexeddb/lib/FDBFactory";
import FDBKeyRange from "fake-indexeddb/lib/FDBKeyRange";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { indexedDbService, STORES } from "./indexedDbService";

import type { Client } from "./persistentClientService";

// Mock IndexedDB for testing
const fakeIndexedDB = new FDBFactory();
Object.defineProperty(global, "indexedDB", {
  value: fakeIndexedDB,
  writable: true,
});
Object.defineProperty(global, "IDBKeyRange", {
  value: FDBKeyRange,
  writable: true,
});

describe("Database Operations", () => {
  let testClient: Client;

  beforeEach(async () => {
    await indexedDbService.init();

    testClient = {
      id: "test-client-1",
      name: "Test Organization",
      shortName: "Test Org",
      primaryContactEmail: "test@example.com",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });

  afterEach(async () => {
    await indexedDbService.clear(STORES.CLIENTS);
    await indexedDbService.close();
  });

  describe("Client Operations", () => {
    it("should create and retrieve a client", async () => {
      // Create
      await indexedDbService.put(STORES.CLIENTS, testClient);

      // Retrieve
      const retrieved = await indexedDbService.get(
        STORES.CLIENTS,
        testClient.id,
      );

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe(testClient.name);
      expect(retrieved?.id).toBe(testClient.id);
    });

    it("should update a client", async () => {
      // Create
      await indexedDbService.put(STORES.CLIENTS, testClient);

      // Update
      const updatedClient = {
        ...testClient,
        name: "Updated Organization",
        updatedAt: Date.now() + 1000,
      };
      await indexedDbService.put(STORES.CLIENTS, updatedClient);

      // Retrieve
      const retrieved = await indexedDbService.get(
        STORES.CLIENTS,
        testClient.id,
      );

      expect(retrieved?.name).toBe("Updated Organization");
      expect(retrieved?.updatedAt).toBe(updatedClient.updatedAt);
    });

    it("should delete a client", async () => {
      // Create
      await indexedDbService.put(STORES.CLIENTS, testClient);

      // Verify exists
      let retrieved = await indexedDbService.get(STORES.CLIENTS, testClient.id);
      expect(retrieved).toBeDefined();

      // Delete
      await indexedDbService.delete(STORES.CLIENTS, testClient.id);

      // Verify deleted
      retrieved = await indexedDbService.get(STORES.CLIENTS, testClient.id);
      expect(retrieved).toBeUndefined();
    });

    it("should list all clients", async () => {
      const clients = [
        testClient,
        {
          ...testClient,
          id: "test-client-2",
          name: "Another Organization",
        },
      ];

      // Create multiple clients
      for (const client of clients) {
        await indexedDbService.put(STORES.CLIENTS, client);
      }

      // Retrieve all
      const allClients = await indexedDbService.getAll(STORES.CLIENTS);

      expect(allClients).toHaveLength(2);
      expect(allClients.map((c) => c.id)).toContain("test-client-1");
      expect(allClients.map((c) => c.id)).toContain("test-client-2");
    });
  });

  describe("Database Management", () => {
    it("should count items in a store", async () => {
      // Initially empty
      let count = await indexedDbService.count(STORES.CLIENTS);
      expect(count).toBe(0);

      // Add client
      await indexedDbService.put(STORES.CLIENTS, testClient);

      // Count should increase
      count = await indexedDbService.count(STORES.CLIENTS);
      expect(count).toBe(1);
    });

    it("should clear a store", async () => {
      // Add client
      await indexedDbService.put(STORES.CLIENTS, testClient);

      // Verify exists
      let count = await indexedDbService.count(STORES.CLIENTS);
      expect(count).toBe(1);

      // Clear store
      await indexedDbService.clear(STORES.CLIENTS);

      // Verify empty
      count = await indexedDbService.count(STORES.CLIENTS);
      expect(count).toBe(0);
    });

    it("should handle bulk operations", async () => {
      const clients: Client[] = [
        testClient,
        {
          ...testClient,
          id: "test-client-2",
          name: "Bulk Client 2",
        },
        {
          ...testClient,
          id: "test-client-3",
          name: "Bulk Client 3",
        },
      ];

      // Bulk insert
      await indexedDbService.putMany(STORES.CLIENTS, clients);

      // Verify all inserted
      const allClients = await indexedDbService.getAll(STORES.CLIENTS);
      expect(allClients).toHaveLength(3);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent item gracefully", async () => {
      const nonExistent = await indexedDbService.get(
        STORES.CLIENTS,
        "non-existent-id",
      );
      expect(nonExistent).toBeUndefined();
    });

    it("should handle delete of non-existent item gracefully", async () => {
      // Should not throw
      await expect(
        indexedDbService.delete(STORES.CLIENTS, "non-existent-id"),
      ).resolves.not.toThrow();
    });
  });
});

describe("Database Service Info", () => {
  beforeEach(async () => {
    await indexedDbService.init();
  });

  afterEach(async () => {
    await indexedDbService.close();
  });

  it("should provide database information", async () => {
    const info = await indexedDbService.getInfo();

    expect(info.name).toBe("NexusDB");
    expect(info.version).toBe(1);
    expect(info.stores).toContain(STORES.CLIENTS);
    expect(info.stores).toContain(STORES.CAMPAIGNS);
  });
});
