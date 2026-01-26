/**
 * ENV DE SERVIDOR (Next.js)
 * - BASE_URL → hablar con NestJS (SIEMPRE)
 * - DATABASE_URL → DB directa desde Next (SOLO cuando se use)
 */

const IS_DEV = process.env.NODE_ENV === "development";
const IS_PROD = process.env.NODE_ENV === "production";

// Backend NestJS
const BASE_URL = IS_DEV
  ? process.env.NEXT_PUBLIC_BASE_URL_DEV
  : process.env.NEXT_PUBLIC_BASE_URL_PROD;

if (!BASE_URL) {
  throw new Error(
    `Missing BASE_URL for environment: ${process.env.NODE_ENV}`
  );
}

// Database URL
const DATABASE_URL = process.env.DATABASE_URL;

export const serverEnv = {
  IS_DEV,
  IS_PROD,
  BASE_URL,
  DATABASE_URL,
};

// Solo cuando se necesita DB
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is required for direct DB access");
  }

  return url;
}
