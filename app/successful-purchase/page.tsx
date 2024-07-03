import { Stripe } from "stripe";
import { stripe } from "@/lib/stripe";
import SuccessfulPurchaseClientComponent from "@/app/successful-purchase/SuccessfulPurchase";

export default async function SuccessfulPurchase({
  searchParams,
}: {
  searchParams: { session_id: string; city: string; country: string };
}) {
  let checkoutSession: Stripe.Checkout.Session | null = null;

  checkoutSession = await stripe.checkout.sessions.retrieve(
    searchParams.session_id
  );

  return (
    <div className={"flex flex-col w-full mt-24 justify-center items-center"}>
      <div className={"text-4xl text-black font-semibold mb-16"}>$150</div>
      <SuccessfulPurchaseClientComponent checkoutSession={checkoutSession} />
    </div>
  );
}
