// __tests__/streams.simple.test.ts
import { describe, it, expect, vi } from "vitest";
import { createMocks } from "node-mocks-http";

// Mock CORS
vi.mock("../../lib/cors", () => ({
  runMiddleware: async (_req: any, _res: any, fn: any) => await fn(),
  default: vi.fn(),
}));

// Mock fetch BEFORE importing the handler
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Import handler AFTER mocks
import handler from "../pages/api/streams/[source]/[id]";

describe("GET /api/streams/[source]/[id]", () => {
  it("returns 200 and valid JSON array", async () => {
    // Mock a valid response from fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: "stream1",
          streamNo: 1,
          language: "en",
          hd: true,
          embedUrl: "https://embed.example.com",
          source: "youtube",
        },
      ],
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { source: "youtube", id: "123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const json = res._getJSONData();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0]).toHaveProperty("id");
    expect(json[0]).toHaveProperty("embedUrl");
    expect(json[0].id).toBe("stream1");
  });
});
