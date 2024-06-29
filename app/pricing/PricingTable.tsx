import { errorString } from "@/utils/logging";
import { Logger } from "next-axiom";
import { fetchProduct } from "../actions/stripe";
import PricingTableClientComponent from "./PricingTableClientComponent";
import { getUser } from "../actions/user";

const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const STRIPE_YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;

export default async function PricingTable() {
  const logger = new Logger().with({
    function: "PricingTable",
  });
  if (!STRIPE_MONTHLY_PRICE_ID || !STRIPE_YEARLY_PRICE_ID) {
    logger.error(errorString, { error: "Missing monthly or yearly price id" });
    await logger.flush();
    throw Error("Missing monthly or yearly price id");
  }
  const monthlyPrice = await fetchProduct(STRIPE_MONTHLY_PRICE_ID);
  const yearlyPrice = await fetchProduct(STRIPE_YEARLY_PRICE_ID);
  const { user, isProUser } = await getUser();
  return (
    <PricingTableClientComponent
      monthlyPrice={monthlyPrice}
      yearlyPrice={yearlyPrice}
      user={user}
      isProUser={isProUser}
    />
  );
}
