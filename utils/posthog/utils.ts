import PostHogClient from "@/lib/posthog";

export const posthog = PostHogClient();
export const trackServerEvent = async ({
  email,
  eventName,
  args = {},
}: {
  email: string;
  eventName: string;
  args?: { [_: string]: any };
}) => {
  posthog.identify({
    distinctId: email,
    properties: { email, ...args },
  });
  posthog.capture({
    distinctId: email,
    event: eventName,
    properties: { email, ...args },
  });
  await posthog.shutdown();
};
