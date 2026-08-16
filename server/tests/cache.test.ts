import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedis = vi.hoisted(() => ({
  status: "wait" as string,
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

vi.mock("../src/config/redis", () => ({ redis: mockRedis }));

import { cacheDel, cacheGet, cacheSet } from "../src/utils/cache";

describe("cache helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.status = "wait";
  });

  it("skips Redis when the client is not ready", async () => {
    await expect(cacheGet("k")).resolves.toBeNull();
    await cacheSet("k", { a: 1 }, 30);
    await cacheDel("k");
    expect(mockRedis.get).not.toHaveBeenCalled();
    expect(mockRedis.set).not.toHaveBeenCalled();
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it("reads and writes JSON when Redis is ready", async () => {
    mockRedis.status = "ready";
    mockRedis.get.mockResolvedValue(JSON.stringify({ n: 1 }));
    mockRedis.set.mockResolvedValue("OK");
    mockRedis.del.mockResolvedValue(1);

    await expect(cacheGet("k")).resolves.toEqual({ n: 1 });
    await cacheSet("k", { n: 2 }, 45);
    await cacheDel("k");

    expect(mockRedis.set).toHaveBeenCalledWith("k", JSON.stringify({ n: 2 }), "EX", 45);
    expect(mockRedis.del).toHaveBeenCalledWith("k");
  });

  it("treats Redis errors as a cache miss", async () => {
    mockRedis.status = "ready";
    mockRedis.get.mockRejectedValue(new Error("down"));
    await expect(cacheGet("k")).resolves.toBeNull();
  });
});
