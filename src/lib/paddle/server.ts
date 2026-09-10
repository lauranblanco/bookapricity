import { Environment, Paddle } from "@paddle/paddle-node-sdk";

// Never silently default the Paddle environment — an unset or misspelled
// PADDLE_ENV must fail loudly rather than quietly running against sandbox
// (or, worse, production) by accident.
function getPaddleEnvironment(): Environment {
  const env = process.env.PADDLE_ENV;
  if (env === "production") return Environment.production;
  if (env === "sandbox") return Environment.sandbox;
  throw new Error(
    `PADDLE_ENV must be set to "sandbox" or "production" (got ${JSON.stringify(env)}).`,
  );
}

let paddleClient: Paddle | null = null;

export function getPaddleClient() {
  if (!paddleClient) {
    if (!process.env.PADDLE_API_KEY) {
      throw new Error("PADDLE_API_KEY is not set.");
    }
    paddleClient = new Paddle(process.env.PADDLE_API_KEY, {
      environment: getPaddleEnvironment(),
    });
  }
  return paddleClient;
}
