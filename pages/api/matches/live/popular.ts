// pages/api/matches/live/popular.ts
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
  poster?: string;
  popular: boolean;
  teams?: {
    home?: Team;
    away?: Team;
  };
  sources: { source: string; id: string }[];
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

    // Return cached data if still valid
    if (cachedMatches && now - cacheTimestamp < CACHE_TTL) {
      return res.status(200).json(cachedMatches);
    }

    // Fetch from Streamed API
    const response = await axios.get<Match[]>(
      `${STREAMED_BASE_URL}/api/matches/live/popular`,
      { timeout: 5000 },
    );

    if (!Array.isArray(response.data)) {
      return res
        .status(502)
        .json({ error: "Invalid response from Streamed API" });
    }

    const matches = response.data;

    // Add full badge & poster URLs to match the frontend expectations
    matches.forEach((match) => {
      // Badges: GET /api/images/badge/[id].webp
      if (match.teams) {
        if (match.teams.home?.badge) {
          match.teams.home.badge = `${STREAMED_BASE_URL}/api/images/badge/${match.teams.home.badge}.webp`;
        }
        if (match.teams.away?.badge) {
          match.teams.away.badge = `${STREAMED_BASE_URL}/api/images/badge/${match.teams.away.badge}.webp`;
        }
      }

      // Posters: Construct full URL with .webp extension
      if (match.poster) {
        match.poster = `${STREAMED_BASE_URL}${match.poster}.webp`;
      }
    });

    // Update cache
    cachedMatches = matches;
    cacheTimestamp = now;

    return res.status(200).json(matches);
  } catch (error: any) {
    console.error("Error fetching live matches:", error?.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
