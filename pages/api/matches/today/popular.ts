// pages/api/matches/all-today/popular.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import cors, { runMiddleware } from "../../../../lib/cors";

interface Team {
  name?: string;
  badge?: string;
}

interface Match {
  id: string;
  title: string;
  category: string;
  date: number;
  popular: boolean;
  teams?: {
    home?: Team;
    away?: Team;
  };
  sources: { source: string; id: string }[];
  poster?: string; // URL path provided by API
}

const STREAMED_BASE_URL = process.env.STREAMED_BASE_URL!;
const CACHE_TTL = Number(process.env.CACHE_TTL_MS) || 60_000;

// In-memory cache
let cachedMatches: Match[] | null = null;
let cacheTimestamp = 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Match[] | { error: string }>,
) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  try {
    const now = Date.now();

    if (cachedMatches && now - cacheTimestamp < CACHE_TTL) {
      return res.status(200).json(cachedMatches);
    }

    const response = await axios.get<Match[]>(
      `${STREAMED_BASE_URL}/api/matches/all-today/popular`,
      { timeout: 5000 },
    );

    if (!Array.isArray(response.data)) {
      return res
        .status(502)
        .json({ error: "Invalid response from Streamed API" });
    }

    // Sort football first, then by title ascending
    const sorted = response.data.sort((a, b) => {
      if (a.category === "football" && b.category !== "football") return -1;
      if (a.category !== "football" && b.category === "football") return 1;
      return a.title.localeCompare(b.title);
    });

    // Add full badge & poster URLs based on API docs
    sorted.forEach((match) => {
      // Badges: GET /api/images/badge/[id].webp
      if (match.teams) {
        if (match.teams.home?.badge) {
          match.teams.home.badge = `${STREAMED_BASE_URL}/api/images/badge/${match.teams.home.badge}.webp`;
        }
        if (match.teams.away?.badge) {
          match.teams.away.badge = `${STREAMED_BASE_URL}/api/images/badge/${match.teams.away.badge}.webp`;
        }
      }

      // Posters: Usage Example used https://streamed.pk${match.poster}.webp
      if (match.poster) {
        // We ensure it is a clean URL based on the documentation's example logic
        match.poster = `${STREAMED_BASE_URL}${match.poster}.webp`;
      }
    });

    cachedMatches = sorted;
    cacheTimestamp = now;

    return res.status(200).json(sorted);
  } catch (error: any) {
    console.error(
      "Error fetching today popular matches:",
      error?.message || error,
    );
    return res.status(500).json({ error: "Internal server error" });
  }
}
