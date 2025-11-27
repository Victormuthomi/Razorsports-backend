// lib/cors.ts
import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize CORS middleware
const cors = Cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200, // Ensure legacy browsers support
});

// Helper to run middleware with promises
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: typeof cors,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) return reject(result);
      resolve();
    });
  });
}

export default cors;
