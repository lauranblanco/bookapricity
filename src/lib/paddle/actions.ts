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
export async function createCheckoutTransaction() {
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
    items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!, quantity: 1 }],
    customerId,
    customData: { club_id: club.id },
  });

  return { transactionId: transaction.id };
}
