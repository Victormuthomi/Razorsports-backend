// __tests__/matchById.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";

// 1️⃣ Set env BEFORE importing handler
process.env.STREAMED_BASE_URL = "http://mock-streamed.com";

// 2️⃣ Mock CORS middleware
vi.mock("../lib/cors", () => ({
  runMiddleware: async (_req: any, _res: any, fn: any) => await fn(),
  default: vi.fn(),
}));

// 3️⃣ Mock axios
import axios from "axios";
const mockedAxios = axios as unknown as { get: vi.Mock };
vi.mock("axios");

// 4️⃣ Import handler after mocks
import handler from "../pages/api/matches/[id]";

describe("GET /api/matches/[id] (simple)", () => {
  beforeEach(() => mockedAxios.get.mockReset());

  it("returns 200 and match JSON when valid ID is provided", async () => {
    const mockMatches = [
      {
        id: "match1",
        title: "Football Match",
        category: "football",
        date: 123,
        popular: true,
        teams: { home: { badge: "home1" }, away: { badge: "away1" } },
        sources: [],
      },
      {
        id: "match2",
        title: "Basketball Match",
        category: "basketball",
        date: 456,
        popular: true,
        teams: {},
        sources: [],
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockMatches });

    const { req, res } = createMocks({
      method: "GET",
      query: { id: "match1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const json = res._getJSONData();
    expect(json).toHaveProperty("id", "match1");
    expect(json).toHaveProperty("title", "Football Match");
    expect(json).toHaveProperty("category", "football");
  });

  it("returns 404 if match ID not found", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const { req, res } = createMocks({
      method: "GET",
      query: { id: "notfound" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({ error: "Match not found" });
  });

  it("returns 400 if invalid ID is provided", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { id: ["array", "instead", "of", "string"] },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: "Invalid match ID" });
  });

  it("returns 500 if axios fails", async () => {
    // Silence console.error during test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockedAxios.get.mockImplementationOnce(() =>
      Promise.reject(new Error("Network error")),
    );

    const { req, res } = createMocks({
      method: "GET",
      query: { id: "match1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: "Internal server error" });

    consoleSpy.mockRestore();
  });
});
