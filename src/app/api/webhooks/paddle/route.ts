import { getPaddleClient } from "@/lib/paddle/server";
import { createServiceClient } from "@/lib/supabase/service";
import { EventName } from "@paddle/paddle-node-sdk";
import { NextResponse, type NextRequest } from "next/server";

// Paddle subscription statuses -> our clubs.subscription_status values.
// "paused" and "canceled" both revoke platform access.
const SUBSCRIPTION_STATUS_MAP = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  paused: "cancelled",
  canceled: "cancelled",
} as const;

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

      if (clubId && subscriptionStatus) {
        const supabase = createServiceClient();
        await supabase
          .from("clubs")
          .update({
            subscription_status: subscriptionStatus,
            paddle_customer_id: event.data.customerId,
            paddle_subscription_id: event.data.id,
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
