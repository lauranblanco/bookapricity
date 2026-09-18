import { getPaddleClient } from "@/lib/paddle/server";
import { createServiceClient } from "@/lib/supabase/service";
import { EventName } from "@paddle/paddle-node-sdk";
import { NextResponse, type NextRequest } from "next/server";
import type { PlanId } from "@/lib/plans/limits";

// Paddle subscription statuses -> our clubs.subscription_status values.
// "paused" and "canceled" both revoke platform access.
const SUBSCRIPTION_STATUS_MAP = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  paused: "cancelled",
  canceled: "cancelled",
} as const;

// Paddle price id -> our clubs.plan values. Both env vars are also read
// client-side (see src/lib/paddle/tiers.ts) to build the pricing cards.
const PLAN_BY_PRICE_ID: Record<string, Exclude<PlanId, "free">> = {
  [process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_SMALL!]: "small",
  [process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_UNLIMITED!]: "unlimited",
};

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const paddle = getPaddleClient();

  let event;
  try {
    event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET!,
      signature,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionActivated:
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionPastDue:
    case EventName.SubscriptionPaused:
    case EventName.SubscriptionResumed:
    case EventName.SubscriptionTrialing: {
      const clubId = event.data.customData?.club_id as string | undefined;
      const subscriptionStatus = SUBSCRIPTION_STATUS_MAP[event.data.status];
      const purchasedPriceId = event.data.items[0]?.price?.id;
      const plan = purchasedPriceId ? PLAN_BY_PRICE_ID[purchasedPriceId] : undefined;

      if (clubId && subscriptionStatus) {
        const supabase = createServiceClient();
        await supabase
          .from("clubs")
          .update({
            subscription_status: subscriptionStatus,
            paddle_customer_id: event.data.customerId,
            paddle_subscription_id: event.data.id,
            ...(plan && { plan }),
          })
          .eq("id", clubId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
