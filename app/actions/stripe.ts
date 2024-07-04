"use server";

import type { Stripe } from "stripe";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/app/actions/user";
import { Logger } from "next-axiom";
import { trackServerEvent } from "@/utils/posthog/utils";
import { getURL } from "@/utils/utils";

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
      await trackServerEvent({
        email,
        eventName: "initiate_checkout",
        args: {
          email,
          userId: user.id,
          priceId,
        },
      });
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
      priceId,
      userEmail: email ?? "",
    },
    line_items: [
      {
        price: priceId,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    customer_email: email,
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
    return_url: `${getURL()}/accounts`,
  });
  redirect(session.url as string);
};

export const fetchProduct = async (priceId: string) =>
  await stripe.prices.retrieve(priceId);
