"use client";

import { useEffect } from "react";
import { initFacebookSdk } from "@/utils/facebookSdk";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export function FacebookProvider() {
  useEffect(() => {
    void initFacebookSdk();
  });

  return <></>;
}

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
  });
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
