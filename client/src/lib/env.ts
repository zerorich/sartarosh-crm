export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const MOCKS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true";
