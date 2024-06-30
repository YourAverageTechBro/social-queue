"use client";

import { useState } from "react";
import Stripe from "stripe";
import { createCheckoutSession } from "../actions/stripe";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/common/Button";

const freeFeatures = [
  "Unlimited accounts",
  "Post videos to TikTok, Instagram, and Youtube",
  "Post to accounts with a Social Queue hashtag",
];

const premiumFeatures = [
  "Everything in the free tier",
  "Post to accounts without a Social Queue hashtag",
];
export default function PricingTableClientComponent({
  monthlyPrice,
  user,
  yearlyPrice,
  isProUser,
}: {
  monthlyPrice: Stripe.Price;
  user: User | null;
  yearlyPrice: Stripe.Price;
  isProUser: boolean;
}) {
  const [isYearly, setIsYearly] = useState(false);

  const handleToggle = () => {
    setIsYearly(!isYearly);
  };

  const monthlyPriceAmount = monthlyPrice.unit_amount || 0;
  const yearlyPriceAmount = yearlyPrice.unit_amount || 0;

  return (
    <div className="pricing-table p-2">
      <h1 className="text-3xl font-bold text-center mb-8">Pricing</h1>
      <div className="flex justify-center mb-8">
        <button
          className={`px-4 py-2 rounded-l-lg ${
            !isYearly ? "bg-orange-600 text-white" : "bg-gray-700"
          }`}
          onClick={handleToggle}
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 rounded-r-lg ${
            isYearly ? "bg-orange-600 text-white" : "bg-gray-700"
          }`}
          onClick={handleToggle}
        >
          Yearly
        </button>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div className="pricing-card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Basic</h2>
          <p className="text-4xl font-bold mb-4">Free</p>
          <ul className="mb-4 list-disc list-inside">
            {freeFeatures.map((feature, index) => (
              <li key={index} className="mb-2">
                {feature}
              </li>
            ))}
          </ul>
          <Button href="/login">Get Started</Button>
        </div>
        <div className="pricing-card bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Pro </h2>
          <div className="flex items-baseline text-4xl font-bold mb-2 gap-4">
            <div>
              <span>
                ${(isYearly ? yearlyPriceAmount : monthlyPriceAmount) / 100}/
                {isYearly ? "year" : "month"}
              </span>
            </div>
            {isYearly && (
              <div className="flex items-baseline text-lg font-semibold mb-2 text-gray-400">
                (${yearlyPriceAmount / 12 / 100}/month)
              </div>
            )}
          </div>
          {isYearly && (
            <p className="text-green-500 font-semibold mb-2">
              2 months free compared to monthly!
            </p>
          )}
          <ul className="mb-4 list-disc list-inside">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="mb-2">
                {feature}
              </li>
            ))}
          </ul>
          {!user ? (
            <Button href="/login">Upgrade Now</Button>
          ) : isProUser ? (
            <div className="badge bg-green-500 text-white p-2 rounded-lg">
              You're already a pro user
            </div>
          ) : (
            <form action={createCheckoutSession}>
              <input type="hidden" name="priceId" value={yearlyPrice.id} />
              <Button type="submit">Upgrade Now</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
