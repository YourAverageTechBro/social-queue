"use client";

import { Stripe } from "stripe";
import { Button } from "@/components/common/Button";

export default function SuccessfulPurchaseClientComponent({
  checkoutSession,
}: {
  checkoutSession: Stripe.Checkout.Session;
}) {
  let statusString;
  if (!checkoutSession) {
    statusString = "It doesn't seem like you purchased anything 🤔";
  } else if (checkoutSession.payment_status === "paid") {
    statusString = "Congrats on your purchase!";
  } else {
    statusString =
      "Something went wrong and your purchases didn't go through. Please try again.";
  }

  return (
    <div className={"w-full text-center flex flex-col items-center gap-2"}>
      <p className={"text-2xl font-bold"}> {statusString}</p>
      <Button href={`/create-post`}>Create A Post</Button>
    </div>
  );
}
