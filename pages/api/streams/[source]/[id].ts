import type { NextApiRequest, NextApiResponse } from "next";
import cors, { runMiddleware } from "../../../../lib/cors";

// Type for a Stream object from Streamed API
interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Stream[] | { error: string }>,
) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  const { source, id } = req.query;

  if (!source || !id || Array.isArray(source) || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid source or id" });
  }

  try {
    const response = await fetch(
      `https://streamed.pk/api/stream/${source}/${id}`,
      { method: "GET", cache: "no-store" }, // ensure fresh fetch each time
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch streams" });
    }

    const streams: Stream[] = await response.json();
    if (!Array.isArray(streams)) {
      return res
        .status(502)
        .json({ error: "Invalid response format from Streamed API" });
    }

    return res.status(200).json(streams);
  } catch (err: any) {
    console.error("Error fetching streams:", err?.message || err);
    return res.status(500).json({ error: "Server error fetching streams" });
  }
}
