"use server";

import { errorString, startingFunctionString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import youtubeAuthClient from "@/utils/youtube";
import { randomBytes } from "crypto";
import { Credentials } from "google-auth-library";
import { google } from "googleapis";
import { Logger } from "next-axiom/dist/logger";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Readable } from "node:stream";

export type YoutubeVideoStatus = "private" | "public";

export const connectYoutubeAccount = async () => {
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
  ];

  const state = randomBytes(32).toString("hex");
  const authUrl = youtubeAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    state: state,
  });

  redirect(authUrl);
};

export const postVideoToYoutube = async ({
  title,
  video,
  userId,
  parentSocialMediaPostId,
  youtubeChannelId,
  isPrivate,
}: {
  title: string;
  video: File;
  userId: string;
  parentSocialMediaPostId: string;
  youtubeChannelId: string;
  isPrivate: boolean;
}) => {
  const logger = new Logger().with({
    function: "postVideoToYoutube",
    title,
    userId,
    parentSocialMediaPostId,
    youtubeChannelId,
  });
  logger.info(startingFunctionString);
  const youtubeAccount = await getYoutubeAccountForUser({
    userId,
    youtubeChannelId,
  });

  const { credentials } = youtubeAccount;
  youtubeAuthClient.setCredentials(credentials as Credentials);
  try {
    const youtube = google.youtube("v3");
    const resp = await youtube.videos.insert({
      auth: youtubeAuthClient,
      part: ["snippet", "status"],
      requestBody: {
        snippet: { title },
        status: { privacyStatus: isPrivate ? "private" : "public" },
      },
      media: {
        body: Readable.from(video.stream() as any),
        mimeType: "video/mp4",
      },
    });
    const videoId = resp?.data.id;
    if (!videoId) {
      logger.error(errorString, {
        error: "Video id not found",
      });
      await logger.flush();
      return {
        error:
          "Sorry, we couldn't upload your video to YouTube. Please try again.",
      };
    }
    logger.info("Video uploaded to youtube", {
      videoId,
    });
    await logger.flush();
    const supabase = createClient();
    await supabase.from("youtube-posts").insert({
      id: videoId,
      parent_social_media_post_id: parentSocialMediaPostId,
      title,
      user_id: userId,
      youtube_channel_id: youtubeChannelId,
    });
  } catch (error: any) {
    // Handle API errors
    if (error.response && error.response.data) {
      const apiError = error.response.data.error;
      logger.error(errorString, {
        error: apiError.message,
        code: apiError.code,
        errors: apiError.errors,
      });
    } else {
      logger.error(errorString, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    await logger.flush();
    throw error;
  }
};

const getYoutubeAccountForUser = async ({
  userId,
  youtubeChannelId,
}: {
  userId: string;
  youtubeChannelId: string;
}) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("youtube-channels")
    .select("*")
    .eq("user_id", userId)
    .eq("id", youtubeChannelId);
  if (error) {
    throw error;
  }
  if (!data[0]) {
    throw new Error("Youtube account not found");
  }
  return data[0];
};

export const deleteYoutubeChannel = async (prevState: any, data: FormData) => {
  const userId = data.get("userId") as string;
  const youtubeChannelId = data.get("youtubeChannelId") as string;
  const logger = new Logger().with({
    userId,
    youtubeChannelId,
  });
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("youtube-channels")
      .delete()
      .eq("user_id", userId)
      .eq("id", youtubeChannelId);
    if (error) {
      logger.error(errorString, error);
      await logger.flush();
      return {
        error:
          "Sorry, we ran into an error deleting your Instagram account. Please try again.",
      };
    }

    const { error: storageError } = await supabase.storage
      .from(
        process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET!
      )
      .remove([`${userId}/youtubeChannel/${youtubeChannelId}`]);
    if (storageError) {
      logger.error(errorString, storageError);
      await logger.flush();
      return {
        error:
          "Sorry, we ran into an error deleting your Instagram account. Please try again.",
      };
    }
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    await logger.flush();
    return {
      error:
        "Sorry, we ran into an error deleting your Instagram account. Please try again.",
    };
  } finally {
    await logger.flush();
  }
  revalidatePath("/accounts");
  return {
    data: "Successfully deleted YouTube channel",
    error: null,
  };
};

export const getYoutubeChannelInfo = async (token: Credentials) => {
  const logger = new Logger().with({
    function: "getYoutubeChannelInfo",
    token,
  });
  youtubeAuthClient.setCredentials(token);
  var service = google.youtube("v3");

  const response = await service.channels.list({
    auth: youtubeAuthClient,
    part: ["snippet", "contentDetails", "statistics"],
    mine: true,
  });

  var channels = response?.data.items;
  if (!channels) {
    logger.error(errorString, {
      error: "No response from YouTube API",
    });
    throw new Error("No response from YouTube API");
  }
  if (channels.length == 0) {
    logger.error(errorString, { error: "No channel found." });
    throw Error("No channel found.");
  }
  logger.info("Fetched channel", channels[0]);

  const snippet = channels[0].snippet;
  if (!snippet) {
    logger.error(errorString, { error: "No snippet found." });
    throw new Error("No snippet found.");
  }
  const customUrl = snippet.customUrl;
  const accessToken = token.access_token;
  const channelId = channels[0].id;
  const thumbnail = snippet.thumbnails?.default?.url;
  return {
    customUrl,
    accessToken,
    channelId,
    thumbnail,
  };
};
