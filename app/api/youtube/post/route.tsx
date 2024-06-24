import { postVideoToYoutube, YoutubeVideoStatus } from "@/app/actions/youtube";
import { AxiomRequest, withAxiom } from "next-axiom";
import { NextResponse } from "next/server";

export const POST = withAxiom(async (req: AxiomRequest) => {
  try {
    const body = await req.formData();
    const userId = body.get("userId") as string;
    const title = body.get("title") as string;
    const video = body.get("video") as File;
    const youtubeChannelId = body.get("youtubeChannelId") as string;
    const isPrivate = body.get("isPrivate") === "true";
    const parentSocialMediaPostId = body.get(
      "parentSocialMediaPostId"
    ) as string;

    await postVideoToYoutube({
      userId,
      title,
      video,
      youtubeChannelId,
      parentSocialMediaPostId,
      isPrivate,
    });
    return NextResponse.json({ message: "success" });
  } catch (error) {
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
