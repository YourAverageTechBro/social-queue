"use server";

import { errorString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import youtubeAuthClient from "@/utils/youtube";
import { randomBytes } from "crypto";
import { Credentials } from "google-auth-library";
import { google } from "googleapis";
import { Logger } from "next-axiom/dist/logger";
import { redirect } from "next/navigation";
import { once, PassThrough, Readable } from "node:stream";

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
  youtubeTitle,
}: {
  title: string;
  video: File;
  userId: string;
  parentSocialMediaPostId: string;
  youtubeChannelId: string;
  youtubeTitle?: string;
}) => {
  const logger = new Logger().with({
    function: "postVideoToYoutube",
    title,
    userId,
    parentSocialMediaPostId,
    youtubeChannelId,
  });
  const youtubeAccount = await getYoutubeAccountForUser({
    userId,
    youtubeChannelId,
  });

  const { credentials } = youtubeAccount;
  youtubeAuthClient.setCredentials(credentials as Credentials);
  try {
    const youtube = google.youtube("v3");
    youtube.videos.insert(
      {
        auth: youtubeAuthClient,
        part: ["snippet", "status"],
        requestBody: {
          snippet: { title: youtubeTitle ?? "" },
          status: { privacyStatus: "private" },
        },
        media: {
          body: Readable.from(video.stream() as any),
          mimeType: "video/mp4",
        },
      },
      async (error, resp) => {
        if (error) {
          logger.error(errorString, {
            error: error instanceof Error ? error.message : String(error),
            resp,
          });
          await logger.flush();
        } else {
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
          });
        }
      }
    );
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : String(error),
    });
    await logger.flush();
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