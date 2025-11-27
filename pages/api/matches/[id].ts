// pages/api/matches/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import cors, { runMiddleware } from "../../../lib/cors";

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

const STREAMED_BASE_URL =
  process.env.STREAMED_BASE_URL || "https://streamed.pk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Match | { error: string }>,
) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid match ID" });
  }

  try {
    // Fetch all popular matches with timeout
    const response = await axios.get<Match[]>(
      `${STREAMED_BASE_URL}/api/matches/all/popular`,
      { timeout: 5000 }, // 5 seconds timeout
    );
    const matches = response.data;

    if (!Array.isArray(matches)) {
      return res
        .status(502)
        .json({ error: "Invalid response from Streamed API" });
    }

    const match = matches.find((m) => m.id === id);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Append full badge URLs
    if (match.teams) {
      if (match.teams.home?.badge) {
        match.teams.home.badge = `${STREAMED_BASE_URL}/api/images/badge/${match.teams.home.badge}.webp`;
      }
      if (match.teams.away?.badge) {
        match.teams.away.badge = `${STREAMED_BASE_URL}/api/images/badge/${match.teams.away.badge}.webp`;
      }
    }

    // Append full poster URL
    if (match.poster) {
      match.poster = `${STREAMED_BASE_URL}${match.poster}.webp`;
    }

    return res.status(200).json(match);
  } catch (error: any) {
    console.error("Error fetching match by ID:", error?.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
