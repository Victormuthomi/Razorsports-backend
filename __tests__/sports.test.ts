// __tests__/sports.simple.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";
import axios from "axios";

// Mock CORS
vi.mock("../../lib/cors", () => ({
  runMiddleware: async (_req: any, _res: any, fn: any) => await fn(),
  default: vi.fn(),
}));

// Mock axios
const mockedAxios = axios as unknown as { get: vi.Mock };
vi.mock("axios");

// Import handler after mocks
import handler from "../pages/api/sports";

describe("GET /api/sports", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it("returns 200 and JSON array", async () => {
    // Mock a valid response
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { id: "football", name: "Football" },
        { id: "basketball", name: "Basketball" },
      ],
    });

    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const json = res._getJSONData();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0]).toHaveProperty("id");
    expect(json[0]).toHaveProperty("name");
  });
});
