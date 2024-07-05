import { postVideoToYoutube, YoutubeVideoStatus } from "@/app/actions/youtube";
import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import { AxiomRequest, Logger, withAxiom } from "next-axiom";
import { NextResponse } from "next/server";

export const maxDuration = 300;

export const POST = withAxiom(async (req: AxiomRequest) => {
  const body = await req.formData();
  const userId = body.get("userId") as string;
  const title = body.get("title") as string;
  const videoPath = body.get("videoPath") as string;
  const youtubeChannelId = body.get("youtubeChannelId") as string;
  const isPrivate = body.get("isPrivate") === "true";
  const parentSocialMediaPostId = body.get("parentSocialMediaPostId") as string;
  const logger = req.log.with({
    path: "/api/youtube/post",
    method: "POST",
    userId,
    title,
    youtubeChannelId,
    parentSocialMediaPostId,
    isPrivate,
  });
  try {
    logger.info(startingFunctionString);
    const video = await downloadVideo(videoPath, logger);

    await postVideoToYoutube({
      userId,
      title,
      video,
      youtubeChannelId,
      parentSocialMediaPostId,
      isPrivate,
    });
    logger.info(endingFunctionString);
    return NextResponse.json({ message: "success" });
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong, please try again.",
      },
      { status: 500 }
    );
  }
});

const downloadVideo = async (videoPath: string, logger: Logger) => {
  const supabase = createClient();

  const bucketName =
    process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET;
  if (!bucketName) {
    logger.error(errorString, {
      error:
        "NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET is not set",
    });
    throw new Error(
      "NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET is not set"
    );
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(videoPath);
  if (error) {
    logger.error(errorString, error);
    throw new Error(error.message);
  }
  return new File([data], videoPath);
};
