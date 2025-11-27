// pages/api/test.ts
import type { NextApiRequest, NextApiResponse } from "next";
import cors, { runMiddleware } from "../../lib/cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  // Simple test response
  res.status(200).json({ message: "Test API working!" });
}
