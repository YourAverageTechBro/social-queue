import React, { forwardRef } from "react";
import { AnimatedBeams } from "@/components/landing-page/AnimatedBeams";
import { Button } from "@/components/common/Button";
import Text from "@/components/common/Text";
import Footer from "@/components/common/Footer";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import PricingTable from "./pricing/PricingTable";

export default function SocialQueue() {
  return (
    <div className="max-w-[1024px]">
      <HeroComponent />
      <FeaturesSection />
      <UsVsCompetitors />
      <PricingTable />
      <CallToAction />
      <Footer />
    </div>
  );
}

const HeroComponent = () => (
  <div className={"flex items-center gap-2 flex-col md:flex-row py-16"}>
    <div
      className={
        "flex flex-col justify-center items-center md:items-start gap-4"
      }
    >
      <h1 className={"font-bold text-6xl text-center md:text-left"}>
        Upload Once, Post Everywhere
      </h1>
      <Text
        alignment={"left"}
        intent={"subtitle"}
        text={"Social media management for everyone"}
      />
      <Button href={"/login"}> Get Started </Button>
    </div>
    <AnimatedBeams />
  </div>
);

const competitorFeatures = [
  "Charging per number of accounts — can get really expensive 💰",
  "Unnecessary features like comment management, analytics, etc, resulting in increased prices",
  "Limited to no free tier",
];

const socialQueueFeatures = [
  "Flat fee for unlimited accounts — so you never have to stress about adding more accounts 📈",
  "No unnecessary features — just simple social media posting",
  "Very generous free tier",
];

interface FeatureProps {
  features: string[];
  type: "socialqueue" | "competitor";
}

const FeatureTable: React.FC<FeatureProps> = ({ features, type }) => {
  const IconComponent = type === "socialqueue" ? CheckCircleIcon : XCircleIcon;
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <IconComponent
              className={`h-5 w-5 ${
                type === "socialqueue" ? "text-green-500" : "text-red-500"
              } flex-shrink-0`}
            />
            <span className="text-lg">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const UsVsCompetitors = () => {
  return (
    <div className="mt-8 p-2">
      <Text intent={"title"} text={"Social Queue vs Competitors"} />
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
        <div className="bg-gray-900 p-4 rounded-lg w-full md:w-1/2 flex flex-col gap-4 items-center">
          <Text intent={"title"} text={"Competitors 🤢"} />
          <FeatureTable features={competitorFeatures} type="competitor" />
        </div>
        <div className="bg-gray-900 p-4 rounded-lg w-full md:w-1/2 flex flex-col gap-4 items-center">
          <Text intent={"title"} text={"Social Queue 🙂"} />
          <FeatureTable features={socialQueueFeatures} type="socialqueue" />
        </div>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <div className="mt-8 p-2">
      <Text
        alignment={"left"}
        intent={"jumboTitle"}
        text={"Dead Simple Social Media Management"}
      />
      <div className="flex flex-col md:flex-row gap-4 items-center mt-8 bg-gray-900 p-4 rounded-lg">
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <Text
            alignment={"left"}
            intent={"title"}
            text={"1) Connect Your Accounts"}
            color="accent"
          />
          <Text
            alignment={"left"}
            intent={"subtitle"}
            text={
              "Connect an unlimited number of accounts you want to post content to"
            }
          />
        </div>
        <img
          src="/connect-accounts-demo.png"
          className="w-full md:w-1/2 rounded-lg"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mt-8 bg-gray-900 p-4 rounded-lg">
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <Text
            alignment={"left"}
            intent={"title"}
            text={"2) Upload your content you want to post"}
            color="accent"
          />
          <Text
            alignment={"left"}
            intent={"subtitle"}
            text={
              "Upload the content you want to post to all your connected accounts — photos, videos, carousels, you name it"
            }
          />
        </div>
        <img
          src="/create-post-demo.png"
          className="w-full md:w-1/2 rounded-lg"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mt-8 bg-gray-900 p-4 rounded-lg">
        <div className="flex flex-col gap-4 w-full">
          <Text
            alignment={"left"}
            intent={"title"}
            text={"3) Post to as many accounts as you want"}
            color="accent"
          />
          <Text
            alignment={"left"}
            intent={"subtitle"}
            text={
              "Post to as many accounts as you want. It doesn't matter if it's 1 or 100 — we'll post it to all of them."
            }
          />
        </div>
      </div>
    </div>
  );
};

const CallToAction = () => (
  <div className="flex flex-col items-center mt-16">
    <Text
      alignment={"center"}
      intent={"title"}
      text={"Ready to simplify your social media management?"}
      color="white"
    />
    <Button href={"/login"}>Get Started</Button>
  </div>
);
