import { postVideoToYoutube, YoutubeVideoStatus } from "@/app/actions/youtube";
import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";
import { AxiomRequest, withAxiom } from "next-axiom";
import { NextResponse } from "next/server";

export const maxDuration = 300;

export const POST = withAxiom(async (req: AxiomRequest) => {
  const body = await req.formData();
  const userId = body.get("userId") as string;
  const title = body.get("title") as string;
  const video = body.get("video") as File;
  const youtubeChannelId = body.get("youtubeChannelId") as string;
  const isPrivate = body.get("isPrivate") === "true";
  const parentSocialMediaPostId = body.get("parentSocialMediaPostId") as string;
  const logger = req.log.with({
    userId,
    title,
    youtubeChannelId,
    parentSocialMediaPostId,
    isPrivate,
  });
  try {
    logger.info(startingFunctionString);

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
