// lib/sports.ts
import axios from "axios";

let cachedSports: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSports() {
  const now = Date.now();

  // Serve from cache
  if (cachedSports && now - cacheTimestamp < CACHE_TTL) {
    return cachedSports;
  }

  try {
    const res = await axios.get("https://streamed.pk/api/sports");
    if (!Array.isArray(res.data)) throw new Error("Invalid sports data");

    cachedSports = res.data;
    cacheTimestamp = now;

    return cachedSports;
  } catch (err) {
    console.error("Error fetching sports from Streamed:", err);
    // fallback to stale cache
    if (cachedSports) return cachedSports;
    throw err;
  }
}
