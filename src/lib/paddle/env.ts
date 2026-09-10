// Isomorphic (client + server safe) Paddle environment helper — reads only
// the NEXT_PUBLIC_ var, so it's fine to import from "use client" code.
// Never silently defaults: an unset or misspelled value fails loudly rather
// than quietly running against the wrong Paddle account.
export type PaddleClientEnvironment = "sandbox" | "production";

export function getPaddleClientEnvironment(): PaddleClientEnvironment {
  const env = process.env.NEXT_PUBLIC_PADDLE_ENV;
  if (env === "production" || env === "sandbox") return env;
  throw new Error(
    `NEXT_PUBLIC_PADDLE_ENV must be set to "sandbox" or "production" (got ${JSON.stringify(env)}).`,
  );
}
