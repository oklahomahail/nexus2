import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import {
  saveBackup,
  restoreBackup,
  type BackupEnvelope,
} from "./backupService";

describe("restoreBackup", () => {
  beforeEach(() => {
    // Ensure browser environment for tests
    if (typeof window === "undefined") {
      global.window = {} as any;
    }
    if (typeof localStorage === "undefined") {
      global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      } as any;
    }
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("restores from legacy raw-object backups", async () => {
    const backup = {
      id: "legacy-1",
      data: {
        "nexus:campaigns": [{ id: 1 }],
        "nexus:settings": { darkMode: true },
      },
      timestamp: Date.now(),
    };
    await saveBackup(backup as any);
    const res = await restoreBackup("legacy-1");
    expect(res.success).toBe(true);
    expect(localStorage.getItem("nexus:campaigns")).toContain('"id":1');
    expect(localStorage.getItem("nexus:settings")).toContain('"darkMode":true');
  });

  it("restores from envelope backups", async () => {
    const envelope: BackupEnvelope = {
      schemaVersion: 1,
      payload: { "nexus:campaigns": [], "nexus:settings": { locale: "en-US" } },
    };
    await saveBackup({
      id: "env-1",
      data: envelope,
      timestamp: Date.now(),
    } as any);
    const res = await restoreBackup("env-1");
    expect(res.success).toBe(true);
    expect(localStorage.getItem("nexus:settings")).toContain(
      '"locale":"en-US"',
    );
  });

  it("rejects unknown keys", async () => {
    const envelope: BackupEnvelope = {
      schemaVersion: 1,
      payload: { "totally:unknown": 123 },
    };
    await saveBackup({
      id: "bad-keys",
      data: envelope,
      timestamp: Date.now(),
    } as any);
    const res = await restoreBackup("bad-keys");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Unknown keys");
  });

  it("reports partial failures", async () => {
    // First save the backup
    const envelope: BackupEnvelope = {
      schemaVersion: 1,
      payload: { "nexus:campaigns": [], "nexus:settings": { darkMode: false } },
    };
    await saveBackup({
      id: "partial",
      data: envelope,
      timestamp: Date.now(),
    } as any);

    // Mock localStorage.setItem to fail only for nexus:settings
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation((k, _v) => {
        if (k === "nexus:settings") {
          throw new DOMException("Quota", "QuotaExceededError");
        }
        // For other keys, succeed silently
        return undefined;
      });

    const res = await restoreBackup("partial");
    expect(res.success).toBe(false);
    expect(res.restoredKeys).toEqual(["nexus:campaigns"]);
    expect(res.failedKeys).toEqual(["nexus:settings"]);

    spy.mockRestore();
  });

  it("returns not found for unknown id", async () => {
    const res = await restoreBackup("nope");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Backup not found");
  });

  it("rejects incompatible formats", async () => {
    await saveBackup({
      id: "bad",
      data: "{not json}",
      timestamp: Date.now(),
    } as any);
    const res = await restoreBackup("bad");
    expect(res.success).toBe(false);
    expect(res.error).toContain("Incompatible");
  });
});
