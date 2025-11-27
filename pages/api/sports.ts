// pages/api/sports.ts
import type { NextApiRequest, NextApiResponse } from "next";
import cors, { runMiddleware } from "../../lib/cors";
import axios from "axios";

const STREAMED_BASE_URL =
  process.env.STREAMED_BASE_URL || "https://streamed.pk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  // Apply CORS
  await runMiddleware(req, res, cors);

  try {
    // Fetch all sports from Streamed API with timeout
    const response = await axios.get(`${STREAMED_BASE_URL}/api/sports`, {
      timeout: 5000, // 5 seconds timeout
    });

    if (!Array.isArray(response.data)) {
      return res
        .status(502)
        .json({ error: "Invalid response from Streamed API" });
    }

    // Return the sports array
    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Error fetching sports:", err?.message || err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
