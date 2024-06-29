"use server";

import type { Stripe } from "stripe";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import PostHogClient from "@/lib/posthog";
import { getUser } from "@/app/actions/user";
import { Logger } from "next-axiom";

export async function createCheckoutSession(data: FormData): Promise<void> {
  const log = new Logger().with({
    function: "createCheckoutSession",
  });
  const priceId = data.get("priceId") as string;
  const { user } = await getUser();
  if (!user) {
    redirect("/sign-up");
  }
  const email = user.email;
  const prod = process.env.NODE_ENV === "production";
  if (prod) {
    if (email) {
      const posthog = PostHogClient();
      posthog.identify({
        distinctId: email,
        properties: {
          email: email,
        },
      });
      posthog.capture({
        distinctId: email,
        event: "initiate_checkout",
        properties: {
          email: email,
        },
      });
      await posthog.shutdown();
    }
  }

  log.info("Creating checkout session", {
    priceId,
    userId: user.id,
  });

  const sessionCreateParams: Stripe.Checkout.SessionCreateParams = {
    allow_promotion_codes: true,
    mode: "subscription",
    metadata: {
      userId: user.id,
    },
    line_items: [
      {
        price: priceId,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    success_url: `${headers().get(
      "origin"
    )}/successful-purchase?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${headers().get("origin")}/pricing`,
  };

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create(sessionCreateParams);

  redirect(checkoutSession.url as string);
}

export const redirectToStripeCustomerPortal = async (data: FormData) => {
  const stripeCustomerId = data.get("stripeCustomerId") as string;
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${headers().get("origin")}/accounts`,
  });
  redirect(session.url as string);
};

export const fetchProduct = async (priceId: string) =>
  await stripe.prices.retrieve(priceId);
