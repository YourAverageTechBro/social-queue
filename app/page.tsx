"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/utils/utils";
import { AnimatedBeam } from "@/components/common/AnimatedBeam";
import { Button } from "@/components/common/Button";
import Text from "@/components/common/Text";
import Icons from "@/components/common/Icons";
import Footer from "@/components/common/Footer";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export default function SocialQueue() {
  return (
    <div className="max-w-[1024px]">
      <HeroComponent />
      <FeaturesSection />
      <UsVsCompetitors />
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
      <h1 className={"font-bold text-4xl text-center md:text-left"}>
        Upload Once, Post Everywhere
      </h1>
      <Text
        alignment={"left"}
        intent={"subtitle"}
        text={"Social media management for everyone"}
      />
      <Button href={"/login"}> Get Started </Button>
    </div>
    <AnimatedBeamMultipleOutputDemo />
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
        <div className="bg-gray-800 p-4 rounded-lg w-full md:w-1/2 flex flex-col gap-4 items-center">
          <Text intent={"title"} text={"Competitors 🤢"} />
          <FeatureTable features={competitorFeatures} type="competitor" />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg w-full md:w-1/2 flex flex-col gap-4 items-center">
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
        alignment={"center"}
        intent={"title"}
        text={"Dead Simple Social Media Management"}
      />
      <div className="flex flex-col md:flex-row gap-4 items-center mt-8">
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
          className="w-full md:w-1/2 border-2 border-orange-600 rounded-lg"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mt-8">
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
          className="w-full md:w-1/2 border-2 border-orange-600 rounded-lg"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mt-8">
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
    <Text
      alignment={"center"}
      intent={"subtitle"}
      text={
        "Join Social Queue today and start posting to all your accounts effortlessly."
      }
      color="secondary"
    />
    <Button href={"/login"}>Get Started</Button>
  </div>
);

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

const AnimatedBeamMultipleOutputDemo = ({
  className,
}: {
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg bg-background p-10 md:shadow-xl",
        className
      )}
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <Icons.user className="text-black" />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="h-16 w-16">
            <Icons.socialqueue className="h-6 w-6" />
          </Circle>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref}>
            <Icons.instagram className="h-6 w-6" />
          </Circle>
          <Circle ref={div2Ref}>
            <Icons.tiktok className="h-6 w-6" />
          </Circle>
          <Circle ref={div3Ref}>
            <Icons.youtube className="h-6 w-6" />
          </Circle>
        </div>
      </div>

      {/* AnimatedBeams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
        duration={3}
      />
    </div>
  );
};
