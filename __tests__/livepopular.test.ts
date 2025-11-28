// __tests__/livePopular.simple.test.ts
import { describe, it, expect, vi } from "vitest";
import { createMocks } from "node-mocks-http";

// Mock CORS
vi.mock("../../lib/cors", () => ({
  runMiddleware: async (_req: any, _res: any, fn: any) => await fn(),
  default: vi.fn(),
}));

// Mock axios BEFORE importing handler
import axios from "axios";
vi.mock("axios");
const mockedAxios = axios as unknown as { get: vi.Mock };

// Import handler AFTER mocks
import handler from "../pages/api/matches/live/popular";

describe("GET /api/matches/live/popular", () => {
  it("returns 200 and valid JSON array", async () => {
    // Mock a valid JSON response
    mockedAxios.get.mockResolvedValue({
      data: [
        {
          id: "1",
          title: "Live Match 1",
          category: "football",
          date: Date.now(),
          popular: true,
          sources: [],
        },
      ],
    });

    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const json = res._getJSONData();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0]).toHaveProperty("id");
    expect(json[0]).toHaveProperty("title");
    expect(json[0].title).toBe("Live Match 1");
  });
});
