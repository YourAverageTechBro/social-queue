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
    const status = body.get("status") as string as YoutubeVideoStatus;
    const parentSocialMediaPostId = body.get(
      "parentSocialMediaPostId"
    ) as string;

    await postVideoToYoutube({
      userId,
      title,
      video,
      youtubeChannelId,
      parentSocialMediaPostId,
      status,
    });
    return NextResponse.json({ message: "success" });
  } catch (error) {
    return NextResponse.json({ message: "error" });
  }
});
