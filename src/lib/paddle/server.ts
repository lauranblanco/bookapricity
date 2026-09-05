import { Environment, Paddle } from "@paddle/paddle-node-sdk";

let paddleClient: Paddle | null = null;

export function getPaddleClient() {
  if (!paddleClient) {
    paddleClient = new Paddle(process.env.PADDLE_API_KEY!, {
      environment:
        process.env.PADDLE_ENV === "production"
          ? Environment.production
          : Environment.sandbox,
    });
  }
  return paddleClient;
}
