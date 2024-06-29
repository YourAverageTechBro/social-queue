import { redirect } from "next/navigation";
import { redirectToStripeCustomerPortal } from "../actions/stripe";
import { getUser } from "../actions/user";

export default async function ManageSubscriptionPage() {
  const { stripeCustomerId } = await getUser();
  if (!stripeCustomerId) {
    return redirect("/accounts");
  }
  const data = new FormData();
  data.append("stripeCustomerId", stripeCustomerId);
  await redirectToStripeCustomerPortal(data);
}
