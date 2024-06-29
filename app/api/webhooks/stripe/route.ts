import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { AxiomRequest, Logger, withAxiom } from "next-axiom";
import { createAdminClient } from "@/utils/supabase/server";
import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";
import { trackServerEvent } from "@/utils/posthog/utils";

export const maxDuration = 300;

const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const STRIPE_YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;

export const POST = withAxiom(async (req: AxiomRequest) => {
  const log = req.log.with({
    path: "webhooks/stripe",
    method: "POST",
  });
  let event: Stripe.Event;
  let text;
  const supabase = createAdminClient();
  try {
    text = await req.text();
    event = stripe.webhooks.constructEvent(
      text,
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // On error, log and return the error message.
    if (err! instanceof Error) console.log(err);
    log.error(errorString, {
      text,
      error: errorMessage,
    });
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  if (!STRIPE_MONTHLY_PRICE_ID || !STRIPE_YEARLY_PRICE_ID) {
    log.error(errorString, {
      text,
      error: `Unhandled event: ${event.type}`,
    });
    return NextResponse.json(
      { message: "Stripe environment variables not set" },
      { status: 500 }
    );
  }

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "customer.subscription.deleted",
    "invoice.payment_failed",
  ];

  if (permittedEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutSessionCompletedEvent(event, text, log);
          break;
        case "customer.subscription.deleted":
          await handleCustomerSubscriptionDeletedEvent(event, text, log);
          break;
        case "invoice.payment_failed":
          await handleInvoicePaymentFailedEvent(event, text, log);
          break;
        default:
          log.error(errorString, {
            text,
            error: `Unhandled event: ${event.type}`,
          });
          return NextResponse.json(
            { message: "Unknown event" },
            { status: 200 }
          );
      }
    } catch (error) {
      log.error(errorString, {
        text,
        path: "webhooks/stripe",
        method: "POST",
        error,
      });
      return NextResponse.json(
        { message: "Webhook handler failed", error },
        { status: 500 }
      );
    } finally {
      await log.flush();
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: "Received" }, { status: 200 });
});

const handleCheckoutSessionCompletedEvent = async (
  event: Stripe.Event,
  text: string,
  log: Logger
) => {
  const supabase = createAdminClient();
  log.info(startingFunctionString, {
    text,
    path: "webhooks/stripe",
    method: "POST",
    eventType: event.type,
  });
  const data = event.data.object as Stripe.Checkout.Session;
  const { priceId, userEmail, userId } = data.metadata as {
    priceId: string;
    userEmail: string;
    userId: string;
  };

  if (
    priceId !== STRIPE_MONTHLY_PRICE_ID &&
    priceId !== STRIPE_YEARLY_PRICE_ID
  ) {
    return;
  }

  const stripeCustomerId = data.customer as string;

  await supabase.from("pro-users").insert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
  });
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: {
      stripeCustomerId,
    },
  });
  if (error) {
    log.error(errorString, {
      text,
      path: "webhooks/stripe",
      method: "POST",
      error,
    });
    return NextResponse.json(
      { message: "Webhook handler failed", error },
      { status: 500 }
    );
  }
  await trackServerEvent({
    email: userEmail,
    eventName: "successful_purchase",
    args: {
      email: userEmail,
      userId,
      priceId,
      stripeCustomerId,
    },
  });
  log.info(endingFunctionString, {
    text,
    eventType: event.type,
    stripeCustomerId,
  });
};

const handleCustomerSubscriptionDeletedEvent = async (
  event: Stripe.Event,
  text: string,
  log: Logger
) => {
  const supabase = createAdminClient();
  log.info(startingFunctionString, {
    text,
    eventType: event.type,
  });
  const data = event.data.object as Stripe.Subscription;
  const stripeCustomerId = data.customer as string;
  const priceId = data.items.data[0].price.id;
  if (
    priceId !== STRIPE_MONTHLY_PRICE_ID &&
    priceId !== STRIPE_YEARLY_PRICE_ID
  ) {
    return;
  }
  const { error } = await supabase
    .from("pro-users")
    .delete()
    .eq("stripe_customer_id", stripeCustomerId);
  if (error) {
    throw error;
  }
  log.info(endingFunctionString, {
    text,
    eventType: event.type,
    stripeCustomerId,
  });
};

const handleInvoicePaymentFailedEvent = async (
  event: Stripe.Event,
  text: string,
  log: Logger
) => {
  const supabase = createAdminClient();
  log.info("Starting to handle invoice.payment_failed", {
    text,
    eventType: event.type,
  });
  const data = event.data.object as Stripe.Invoice;
  const stripeCustomerId = data.customer as string;
  const priceId = data.lines.data[0].price?.id;
  if (
    !priceId ||
    (priceId !== STRIPE_MONTHLY_PRICE_ID && priceId !== STRIPE_YEARLY_PRICE_ID)
  ) {
    return;
  }
  const { error } = await supabase
    .from("pro-users")
    .delete()
    .eq("stripe_customer_id", stripeCustomerId);
  if (error) {
    throw error;
  }
  log.info(endingFunctionString, {
    text,
    eventType: event.type,
    stripeCustomerId,
  });
};
