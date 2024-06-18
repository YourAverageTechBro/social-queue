import { errorString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import youtubeAuthClient from "@/utils/youtube";
import { google } from "googleapis";
import { AxiomRequest, Logger, withAxiom } from "next-axiom";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const GET = withAxiom(async (request: AxiomRequest) => {
  const logger = request.log.with({
    path: "/auth/youtube/callback",
    method: "GET",
  });
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  try {
    if (error) {
      logger.error(errorString, {
        error,
      });
      return NextResponse.redirect(`${origin}/accounts?error=${error}`);
    } else if (code) {
      let { tokens } = await youtubeAuthClient.getToken(code);
      youtubeAuthClient.setCredentials(tokens);
      var service = google.youtube("v3");
      try {
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
          return NextResponse.redirect(
            `${origin}/accounts?error=No response from YouTube API`
          );
        }
        if (channels.length == 0) {
          logger.error(errorString, { error: "No channel found." });
        } else {
          logger.info("Fetched channel", channels[0]);

          const snippet = channels[0].snippet;
          if (!snippet) {
            logger.error(errorString, { error: "No snippet found." });
            return NextResponse.redirect(
              `${origin}/accounts?error=Sorry, something unexpected happened. Our team is looking into it.`
            );
          }
          const customUrl = snippet.customUrl;
          const thumbnail = snippet.thumbnails?.default?.url;
          const accessToken = tokens.access_token;
          const channelId = channels[0].id;

          if (!customUrl || !thumbnail || !accessToken || !channelId) {
            logger.error(errorString, {
              error: "Essential channel details are missing or incomplete.",
              customUrl,
              thumbnail,
              accessToken,
              channelId,
            });
            return NextResponse.redirect(
              `${origin}/accounts?error=Sorry, something unexpected happened. Our team is looking into it.`
            );
          }

          const supabase = createClient();
          const currentUser = await supabase.auth.getUser();
          const userId = currentUser.data.user?.id;
          if (!userId) {
            logger.error(errorString, { error: "No user found." });
            return NextResponse.redirect(
              `${origin}/accounts?error=Sorry, something unexpected happened. Our team is looking into it.`
            );
          }
          const profilePicturePath = await uploadYoutubeProfilePicture({
            userId,
            channelId,
            pictureUrl: thumbnail,
            logger,
          });
          const { error } = await supabase.from("youtube-channels").insert({
            credentials: { ...tokens },
            channel_custom_url: customUrl,
            profile_picture_path: profilePicturePath,
            id: channelId,
            user_id: userId,
          });
          if (error) {
            logger.error(errorString, { error: error.message });
            return NextResponse.redirect(
              `${origin}/accounts?error=${error.message}`
            );
          }
        }
      } catch (err) {
        logger.error(errorString, {
          error: err instanceof Error ? err.message : String(err),
        });

        return NextResponse.redirect(
          `${origin}/accounts?error=${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  } catch (error: any) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(
      `${origin}/accounts?error=${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  revalidatePath("/accounts");
  return NextResponse.redirect(`${origin}/accounts`);
});

const uploadYoutubeProfilePicture = async ({
  userId,
  channelId,
  pictureUrl,
  logger,
}: {
  userId: string;
  channelId: string;
  pictureUrl: string;
  logger: Logger;
}) => {
  logger = logger.with({
    function: "uploadYoutubeProfilePicture",
    userId,
    channelId,
    pictureUrl,
  });
  const supabase = createClient();

  const bucketName =
    process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET;

  if (!bucketName) {
    logger.error(errorString, {
      error: "No bucket name found in environment",
    });
    await logger.flush();
    throw new Error("No bucket name found in environment");
  }

  let file;
  try {
    const response = await fetch(pictureUrl);
    if (!response.ok) {
      throw new Error(`Failed to download picture from URL: ${pictureUrl}`);
    }
    const blob = await response.blob();
    file = new File([blob], `profile_picture`, { type: blob.type });
  } catch (error) {
    logger.error("Failed to download or create file from URL", {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    await logger.flush();
    throw new Error("Failed to download or create file from URL");
  }

  const filePath = `${userId}/youtubeChannel/${channelId}/profile_picture.${
    file.type.split("/")[1]
  }`;

  // Upload file
  const { data: uploadResponse, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, { upsert: true });
  if (uploadError) {
    logger.error(errorString, uploadError);
    throw Error(
      "Sorry, we had an issue uploading your file. Please try again."
    );
  }
  if (!uploadResponse?.path) {
    logger.error(errorString, {
      error: "No file path found in response from Supabase",
    });
    throw new Error("No file path found in response from Supabase");
  }
  return uploadResponse.path;
};
