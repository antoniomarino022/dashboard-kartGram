/** URL del backend kart-gram: stesso valore per axios e better-auth. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://kart-gram.vercel.app").replace(/\/+$/, "");
