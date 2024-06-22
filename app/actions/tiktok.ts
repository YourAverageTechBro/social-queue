"use server";

import { errorString, startingFunctionString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import {
  getSignedUrl,
  socialMediaPostMediaFilesStorageBucket,
} from "@/utils/supabase/storage";
import { Logger } from "next-axiom";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as crypto from "node:crypto";

export const loginWithTikTok = async () => {
  // const csrfState = Math.random().toString(36).substring(2);

  const codeVerifier = generateRandomString(128);
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("hex");

  let url = "https://www.tiktok.com/v2/auth/authorize/";

  // the following params need to be in `application/x-www-form-urlencoded` format.
  url += `?client_key=${process.env.TIKTOK_CLIENT_KEY}`;
  url += "&scope=user.info.profile,user.info.stats,video.publish,video.upload";
  url += "&response_type=code";
  // url += `&redirect_uri=${headers().get("origin")}/accounts`;
  url += `&redirect_uri=https://socialqueue.ai/auth/tiktok/callback`;
  url += `&code_challenge=${codeChallenge}`;
  url += "&code_challenge_method=S256";
  redirect(url);
};

const generateRandomString = (length: number) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const deleteTikTokAccount = async (prevState: any, data: FormData) => {
  const userId = data.get("userId") as string;
  const tiktokAccountId = data.get("tiktokAccountId") as string;
  const logger = new Logger().with({
    function: "deleteTikTokAccount",
    userId,
    tiktokAccountId,
  });
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("tiktok-accounts")
      .delete()
      .eq("user_id", userId)
      .eq("id", tiktokAccountId);
    if (error) {
      logger.error(errorString, error);
      return {
        error:
          "Sorry, we ran into an error deleting your TikTok account. Please try again.",
      };
    }

    const { error: storageError } = await supabase.storage
      .from(
        process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET!
      )
      .remove([`${userId}/tiktokAccount/${tiktokAccountId}`]);
    if (storageError) {
      logger.error(errorString, storageError);

      return {
        error:
          "Sorry, we ran into an error deleting your TikTok account. Please try again.",
      };
    }
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });

    return {
      error:
        "Sorry, we ran into an error deleting your TikTok account. Please try again.",
    };
  }
  revalidatePath("/accounts");
  return {
    data: "Successfully deleted TikTok account",
    error: null,
  };
};
type PrivacyLevel =
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "FOLLOWER_OF_CREATOR"
  | "SELF_ONLY";

export const uploadTikTokPost = async ({
  userId,
  caption,
  accessToken,
  videoFilePath,
  privacyLevel,
  disableDuet,
  disableComment,
  videoCoverTimestamp,
}: {
  userId: string;
  caption: string;
  accessToken: string;
  videoFilePath: string;
  privacyLevel: PrivacyLevel;
  disableDuet: boolean;
  disableComment: boolean;
  videoCoverTimestamp: number;
}) => {
  let logger = new Logger().with({
    function: "uploadTikTokPost",
    userId,
    caption,
    accessToken,
    videoFilePath,
    privacyLevel,
    disableDuet,
    disableComment,
    videoCoverTimestamp,
  });
  const signedUrl = await getSignedUrl({
    bucketName: socialMediaPostMediaFilesStorageBucket,
    duration: 600,
    filePath: videoFilePath,
  });
  logger = logger.with({
    signedUrl,
  });

  const response = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: caption,
          privacy_level: privacyLevel,
          disable_duet: disableDuet,
          disable_comment: disableComment,
          disable_stitch: false,
          video_cover_timestamp_ms: videoCoverTimestamp,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: signedUrl,
        },
      }),
    }
  );

  const { data, error } = (await response.json()) as {
    data?: {
      publish_id: string;
    };
    error?: {
      code: string;
      message: string;
      log_id: string;
    };
  };

  if (!response.ok) {
    logger.error(errorString, {
      error: `Failed to upload post to TikTok`,
      ...error,
    });
    throw new Error(`Failed to upload post to TikTok`);
  }
  if (!data) {
    throw new Error(`Failed to upload post to TikTok`);
  }
  return data.publish_id;
};

export const writeTikTokPostToSupabase = async ({
  userId,
  publishId,
  parentSocialMediaPostId,
  caption,
  privacyLevel,
  disableComment,
  disableDuet,
  videoCoverTimestamp,
}: {
  userId: string;
  publishId: string;
  parentSocialMediaPostId: string;
  caption: string;
  privacyLevel: PrivacyLevel;
  disableComment: boolean;
  disableDuet: boolean;
  videoCoverTimestamp: number;
}) => {
  const logger = new Logger().with({
    function: "writeTikTokPostToSupabase",
    userId,
    publishId,
    parentSocialMediaPostId,
    caption,
    privacyLevel,
    disableComment,
    disableDuet,
    videoCoverTimestamp,
  });
  const supabase = createClient();
  const { error: supabaseError } = await supabase.from("tiktok-posts").insert({
    user_id: userId,
    publish_id: publishId,
    parent_social_media_post_id: parentSocialMediaPostId,
    caption,
    privacy_level: privacyLevel,
    disable_comment: disableComment,
    disable_duet: disableDuet,
    disable_stitch: false,
    video_cover_timestamp_ms: videoCoverTimestamp,
  });
  if (supabaseError) {
    logger.error(errorString, supabaseError);
    await logger.flush();
    throw new Error(`Failed to save post to database`);
  }
};

type StatusCode = "PROCESSING_DOWNLOAD" | "PUBLISH_COMPLETE" | "FAILED";

type FailureReason =
  | "file_format_check_failed"
  | "duration_check_failed"
  | "frame_rate_check_failed"
  | "picture_size_check_failed"
  | "internal"
  | "video_pull_failed"
  | "photo_pull_failed"
  | "publish_cancelled";

type ErrorCode =
  | "ok"
  | "invalid_publish_id"
  | "token_not_authorized_for_specified_publish_id"
  | "access_token_invalid"
  | "scope_not_authorized"
  | "rate_limit_exceeded"
  | "internal_error";

type TikTokPublishStatusResponseType = {
  data: {
    status: StatusCode;
    fail_reason?: FailureReason;
    publicaly_available_post_id: [string];
    uploaded_bytes: number;
  };
  error: {
    code: ErrorCode;
    message: string;
    log_id: string;
  };
};

export const checkTikTokPublishStatus = async ({
  publishIds,
  accessToken,
}: {
  publishIds: string[];
  accessToken: string;
}) => {
  let logger = new Logger().with({
    function: "checkTikTokPublishStatus",
    publishIds,
    accessToken,
  });

  const checkStatus = async (publishId: string): Promise<StatusCode> => {
    let numberOfPolls = 0;
    const maxNumberOfPolls = 15;
    let statusCode: StatusCode | null = null;

    const url = `https://open.tiktokapis.com/v2/post/publish/status/fetch/`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        publish_id: publishId,
      }),
    });
    const { error, data }: TikTokPublishStatusResponseType =
      await response.json();
    if (error) {
      handleTikTokPublishError(error.code);
    }
    statusCode = data.status;
    handleTikTokPublishStatus(statusCode, data.fail_reason);

    while (statusCode !== "PUBLISH_COMPLETE") {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          publish_id: publishId,
        }),
      });
      const { error, data }: TikTokPublishStatusResponseType =
        await resp.json();
      if (error) {
        handleTikTokPublishError(error.code);
      }

      statusCode = data.status;
      handleTikTokPublishStatus(statusCode, data.fail_reason);

      if (numberOfPolls > maxNumberOfPolls) {
        logger.error("Status check timed out");
        await logger.flush();
        throw new Error("Status check timed out");
      }

      logger.info("Checked tiktok publish status", {
        statusCode,
      });
      numberOfPolls++;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }

    logger.info("Returning tiktok publish status code", { statusCode });
    await logger.flush();
    return statusCode;
  };

  // Run checkStatus for all containerIds concurrently
  const statusPromises = publishIds.map(checkStatus);
  await Promise.all(statusPromises);

  logger.info("All tiktok publish ids have finished processing");
  await logger.flush();
};

const handleTikTokPublishError = (error: ErrorCode) => {
  switch (error) {
    case "invalid_publish_id":
      throw Error("Something went wrong making your post. Please try again.");
    case "token_not_authorized_for_specified_publish_id":
      throw Error(
        "It seems like you didn't have the right permissions to post this video. Please reconnect your account and try again."
      );
    case "access_token_invalid":
      throw Error(
        "It seems like you didn't have the right permissions to post this video. Please reconnect your account and try again."
      );
    case "scope_not_authorized":
      throw Error(
        "It seems like you didn't have the right permissions to post this video. Please reconnect your account and try again."
      );
    case "rate_limit_exceeded":
      throw Error(
        "You've made too many requests to TikTok recently. Please try again in a few minutes."
      );
    case "internal_error":
      throw Error("Something went wrong making your post. Please try again.");
    case "ok":
      return;
    default:
      throw Error("Something went wrong making your post. Please try again.");
  }
};

const handleTikTokPublishStatus = (
  status: StatusCode,
  failReason?: FailureReason
) => {
  switch (status) {
    case "PUBLISH_COMPLETE":
      return;
    case "FAILED":
      switch (failReason) {
        case "file_format_check_failed":
          throw Error(
            "You've uploaded an incompatible file. Please try again with a different file."
          );
        case "duration_check_failed":
          throw Error(
            "You've uploaded a video that is too long. Please try again with a shorter video."
          );
        case "frame_rate_check_failed":
          throw Error("Your video has an unsupported frame rate.");
        case "picture_size_check_failed":
          throw Error(
            "You've uploaded a picture that is too large. Please try a smaller photo."
          );
        case "internal":
          throw Error(
            "Something went wrong making your post. Please try again."
          );
        case "video_pull_failed":
          throw Error(
            "Something went wrong making your post. Please try again."
          );
        case "photo_pull_failed":
          throw Error(
            "Something went wrong making your post. Please try again."
          );
        case "publish_cancelled":
          throw Error(
            "Something went wrong making your post. Please try again."
          );
      }
    case "PROCESSING_DOWNLOAD":
      return;
  }
};

type TikTokCreatorInfoErrorCode =
  | "ok"
  | "spam_risk_too_many_posts"
  | "spam_risk_user_banned_from_posting"
  | "reached_active_user_cap"
  | "unaudited_client_can_only_post_to_private_accounts"
  | "access_token_invalid"
  | "scope_not_authorized"
  | "rate_limit_exceeded"
  | "internal_error";

type TikTokCreatorInfoResponse = {
  data: {
    creator_avatar_url: string;
    creator_username: string;
    creator_nickname: string;
    privacy_level_options: string[];
    comment_disabled: boolean;
    duet_disabled: boolean;
    stitch_disabled: boolean;
    max_video_post_duration_sec: number;
  };
  error: {
    code: TikTokCreatorInfoErrorCode;
    message: string;
    logid: string;
  };
};

export const fetchCreatorInfo = async (accessToken: string) => {
  const logger = new Logger().with({
    function: "fetchCreatorInfo",
    accessToken,
  });
  const response = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );
  const { data, error } = (await response.json()) as TikTokCreatorInfoResponse;
  if (error.code !== "ok") {
    logger.error(errorString, error);
    throw new Error(`Failed to fetch creator info from TikTok`);
  }

  return data;
};
