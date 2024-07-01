"use server";

import { errorString } from "@/utils/logging";
import { createAdminClient, createClient } from "@/utils/supabase/server";
import { Logger } from "next-axiom";
import { fetchCreatorInfo } from "./tiktok";
import { Tables } from "@/types/supabase";
import {
  fetchInstagramPublishingRateLimit,
  fetchInstagramUsernameFromPageId,
} from "./instagramAccounts";
import { getYoutubeChannelInfo } from "./youtube";
import { Credentials } from "google-auth-library";

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
        instagramAccounts?.map(
          async (account): Promise<InstagramAccountWithVideoRestrictions> => {
            let profile_picture_url;
            let username;

            const response = await fetchInstagramUsernameFromPageId({
              instagramBusinessAccountId: account.instagram_business_account_id,
              accessToken: account.access_token,
            });

            username = response?.username;
            profile_picture_url = response?.profile_picture_url;

            const {
              config: { quota_total },
              quota_usage,
            } = await fetchInstagramPublishingRateLimit({
              instagramBusinessAccountId: account.instagram_business_account_id,
              userId,
            });
            return {
              ...account,
              account_name:
                username ??
                "error fetching account — refresh or reconnect your account",
              picture_file_path:
                profile_picture_url ?? (await generateEmptyProfilePictureUrl()),
              min_video_duration: 3,
              max_video_duration: 90,
              max_video_size: 1024 * 1024 * 1024,
              error:
                response?.error?.message ??
                (quota_usage === quota_total
                  ? "You've posted too many times recently. Please try again later."
                  : ""),
            };
          }
        )
      )
    : [];

  const youtubeChannelsWithSignedUrl = youtubeChannels
    ? await Promise.all(
        youtubeChannels?.map(
          async (channel): Promise<YoutubeChannelWithVideoRestrictions> => {
            const { thumbnail } = await getYoutubeChannelInfo(
              channel.credentials as Credentials
            );
            return {
              ...channel,
              profile_picture_path:
                thumbnail ?? (await generateEmptyProfilePictureUrl()),
              min_video_duration: 3,
              max_video_duration: 60,
              max_video_size: 1024 * 1024 * 1024 * 256,
              error: "",
            };
          }
        )
      )
    : [];

  const tiktokAccountsWithSignedUrl = tiktokAccounts
    ? await Promise.all(
        tiktokAccounts?.map(
          async (account): Promise<TikTokAccountWithVideoRestrictions> => {
            const { data, errorMessage } = await fetchCreatorInfo(
              account.access_token
            );
            return {
              ...account,
              profile_picture_file_path:
                data?.creator_avatar_url ??
                (await generateEmptyProfilePictureUrl()),
              account_name:
                data?.creator_nickname ??
                "error fetching account — refresh or reconnect your account",
              min_video_duration: 3,
              max_video_duration: data?.max_video_post_duration_sec ?? 0,
              max_video_size: 1024 * 1024 * 1024 * 4,
              error: errorMessage,
            };
          }
        )
      )
    : [];

  return {
    instagramAccounts: instagramAccountsWithSignedUrl,
    youtubeChannels: youtubeChannelsWithSignedUrl,
    tiktokAccounts: tiktokAccountsWithSignedUrl,
  };
};

export type TikTokAccountWithVideoRestrictions = Tables<"tiktok-accounts"> & {
  profile_picture_file_path: string;
  account_name: string;
} & VideoPostingRestrictions;

export type YoutubeChannelWithVideoRestrictions = Tables<"youtube-channels"> &
  VideoPostingRestrictions & {
    profile_picture_path: string;
  };

export type InstagramAccountWithVideoRestrictions =
  Tables<"instagram-accounts"> &
    VideoPostingRestrictions & {
      account_name: string;
      picture_file_path: string;
    };

type VideoPostingRestrictions = {
  min_video_duration: number;
  max_video_duration: number;
  max_video_size: number;
  error: string | undefined;
};

const ASSETS_BUCKET = process.env.ASSETS_BUCKET;

const generateEmptyProfilePictureUrl = async () => {
  const logger = new Logger().with({
    function: "generateEmptyProfilePictureUrl",
  });
  if (!ASSETS_BUCKET) {
    logger.error(errorString, {
      error: "No assets bucket found in environment",
    });
    await logger.flush();
    throw new Error("No assets bucket found in environment");
  }
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .createSignedUrl("/empty-profile-picture.png", 60 * 60 * 24 * 300);
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    throw new Error("Failed to generate empty profile picture URL");
  }
  if (!data) {
    logger.error(errorString, {
      error: "No data found in signed URL",
    });
    await logger.flush();
    throw new Error("No data found in signed URL");
  }
  logger.info("Generated empty profile picture URL", {
    signedUrl: data.signedUrl,
  });
  await logger.flush();
  return data.signedUrl;
};
