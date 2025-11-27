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

// In-memory cache
let cachedMatches: Match[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

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
      "https://streamed.pk/api/matches/live/popular",
    );

    if (!Array.isArray(response.data)) {
      return res
        .status(502)
        .json({ error: "Invalid response from Streamed API" });
    }

    // Update cache
    cachedMatches = response.data;
    cacheTimestamp = now;

    return res.status(200).json(cachedMatches);
  } catch (error: any) {
    console.error("Error fetching live matches:", error.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
