"use server";

import { errorString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import { Logger } from "next-axiom";

const bucketName =
  process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET;

export const fetchUserConnectSocialMediaAccounts = async (userId: string) => {
  const logger = new Logger().with({
    userId,
    function: "fetchUserConnectSocialMediaAccounts",
  });
  if (!bucketName) {
    logger.error(errorString, {
      error: "No bucket name found in environment",
    });
    await logger.flush();
    throw new Error("No bucket name found in environment");
  }
  const supabase = createClient();
  const { data: instagramAccounts, error: instagramAccountError } =
    await supabase.from("instagram-accounts").select("*").eq("user_id", userId);
  if (instagramAccountError) {
    logger.error(errorString, instagramAccountError);
  }
  const { data: youtubeChannels, error: youtubeChannelError } = await supabase
    .from("youtube-channels")
    .select("*")
    .eq("user_id", userId);
  if (youtubeChannelError) {
    logger.error(errorString, youtubeChannelError);
  }

  const { data: tiktokAccounts, error: tiktokAccountError } = await supabase
    .from("tiktok-accounts")
    .select("*")
    .eq("user_id", userId);
  if (tiktokAccountError) {
    logger.error(errorString, tiktokAccountError);
  }

  const instagramAccountsWithSignedUrl = instagramAccounts
    ? await Promise.all(
        instagramAccounts?.map(async (account) => {
          const supabase = createClient();
          const { data } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(account.picture_file_path, 60 * 60 * 24 * 300);
          return {
            ...account,
            picture_file_path: data?.signedUrl ?? "",
          };
        })
      )
    : [];

  const youtubeChannelsWithSignedUrl = youtubeChannels
    ? await Promise.all(
        youtubeChannels?.map(async (channel) => {
          const supabase = createClient();
          const { data } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(channel.profile_picture_path, 60 * 60 * 24 * 300);
          return {
            ...channel,
            profile_picture_path: data?.signedUrl ?? "",
          };
        })
      )
    : [];

  const tiktokAccountsWithSignedUrl = tiktokAccounts
    ? await Promise.all(
        tiktokAccounts?.map(async (account) => {
          const supabase = createClient();
          const { data } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(
              account.profile_picture_file_path,
              60 * 60 * 24 * 300
            );
          return {
            ...account,
            profile_picture_file_path: data?.signedUrl ?? "",
          };
        })
      )
    : [];

  return {
    instagramAccounts: instagramAccountsWithSignedUrl,
    youtubeChannels: youtubeChannelsWithSignedUrl,
    tiktokAccounts: tiktokAccountsWithSignedUrl,
  };
};
