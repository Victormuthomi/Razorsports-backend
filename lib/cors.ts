// lib/cors.ts
import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize CORS middleware
const cors = Cors({
  origin: "*", // allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Helper to run middleware with promises
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: typeof cors,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve();
    });
  });
}

export default cors;
