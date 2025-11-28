// __tests__/popular.simple.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";

// Set env before importing handler
process.env.STREAMED_BASE_URL = "http://mock-streamed.com";

// Mock CORS middleware
vi.mock("../../lib/cors", () => ({
  runMiddleware: async (_req: any, _res: any, fn: any) => await fn(),
  default: vi.fn(),
}));

// Mock axios
import axios from "axios";
const mockedAxios = axios as unknown as { get: vi.Mock };
vi.mock("axios");

// Import handler after mocks
import handler from "../pages/api/matches/today/popular";

describe("GET /api/matches/all-today/popular (simple)", () => {
  beforeEach(() => mockedAxios.get.mockReset());

  it("endpoint is reachable and returns JSON array", async () => {
    // Mock axios to return sample data
    const mockData = [
      {
        id: "1",
        title: "Match 1",
        category: "football",
        date: 123,
        popular: true,
        sources: [],
      },
      {
        id: "2",
        title: "Match 2",
        category: "basketball",
        date: 456,
        popular: true,
        sources: [],
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const { req, res } = createMocks({ method: "GET" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const json = res._getJSONData();
    expect(Array.isArray(json)).toBe(true); // just check it's an array
    expect(json.length).toBeGreaterThan(0); // at least one item
    expect(json[0]).toHaveProperty("id");
    expect(json[0]).toHaveProperty("title");
  });
});
