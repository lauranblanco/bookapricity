"use server";

import { getPaddleClient } from "@/lib/paddle/server";
import { createClient } from "@/lib/supabase/server";

async function getOrCreatePaddleCustomerId(email: string) {
  const paddle = getPaddleClient();

  const existingCustomers = await paddle.customers.list({ email: [email] }).next();
  if (existingCustomers.length > 0) {
    return existingCustomers[0].id;
  }

  const customer = await paddle.customers.create({ email });
  return customer.id;
}

// Creates a Paddle transaction for the calling admin's club subscription.
// The transaction id is opened client-side via the Paddle.js overlay
// (Paddle.Checkout.open({ transactionId })).
export async function createCheckoutTransaction(
  priceId: string = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!,
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Not authenticated" };
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("id")
    .eq("admin_id", user.id)
    .single();

  if (clubError || !club) {
    return { error: "No club found for this admin" };
  }

  const paddle = getPaddleClient();
  const customerId = await getOrCreatePaddleCustomerId(user.email);

  const transaction = await paddle.transactions.create({
    items: [{ priceId, quantity: 1 }],
    customerId,
    customData: { club_id: club.id },
  });

  return { transactionId: transaction.id };
}

type OwnClubBilling = { error: string } | { customerId: string; subscriptionId: string };

async function getOwnClubBilling(): Promise<OwnClubBilling> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("paddle_customer_id, paddle_subscription_id")
    .eq("admin_id", user.id)
    .single();

  if (clubError || !club || !club.paddle_customer_id || !club.paddle_subscription_id) {
    return { error: "No billing account found for this club" };
  }

  return {
    customerId: club.paddle_customer_id as string,
    subscriptionId: club.paddle_subscription_id as string,
  };
}

type PortalUrlResult = { error: string } | { url: string };

// Opens the Paddle-hosted customer portal for the calling admin's own club —
// either the general overview (Manage subscription) or a deep link straight
// to updating the payment method (Update payment, shown on past_due).
export async function createPortalSessionUrl(
  target: "overview" | "update_payment",
): Promise<PortalUrlResult> {
  const billing = await getOwnClubBilling();
  if ("error" in billing) return billing;

  const paddle = getPaddleClient();
  const session = await paddle.customerPortalSessions.create(billing.customerId, [
    billing.subscriptionId,
  ]);

  if (target === "overview") {
    return { url: session.urls.general.overview };
  }

  const subscriptionUrls = session.urls.subscriptions.find(
    (s) => s.id === billing.subscriptionId,
  );
  if (!subscriptionUrls) {
    return { error: "Could not open the payment update page" };
  }
  return { url: subscriptionUrls.updateSubscriptionPaymentMethod };
}

// Returns a fresh invoice PDF link for a transaction — only if it actually
// belongs to the calling admin's own club's subscription, so an admin can't
// fetch another club's invoice by guessing a transaction id.
export async function getInvoicePdfUrl(transactionId: string): Promise<PortalUrlResult> {
  const billing = await getOwnClubBilling();
  if ("error" in billing) return billing;

  const paddle = getPaddleClient();
  const transaction = await paddle.transactions.get(transactionId);

  if (transaction.subscriptionId !== billing.subscriptionId) {
    return { error: "Invoice not found" };
  }

  const invoice = await paddle.transactions.getInvoicePDF(transactionId);
  return { url: invoice.url };
}
