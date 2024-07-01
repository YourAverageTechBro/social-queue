import { getYoutubeChannelInfo } from "@/app/actions/youtube";
import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import youtubeAuthClient from "@/utils/youtube";
import { AxiomRequest, Logger, withAxiom } from "next-axiom";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const GET = withAxiom(async (request: AxiomRequest) => {
  let logger = request.log.with({
    path: "/auth/youtube/callback",
    method: "GET",
  });
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  logger = logger.with({
    code,
    error,
    origin,
  });

  try {
    if (error) {
      logger.error(errorString, {
        error,
      });
      return NextResponse.redirect(`${origin}/accounts?error=${error}`);
    } else if (code) {
      try {
        let { tokens } = await youtubeAuthClient.getToken(code);
        const { customUrl, accessToken, channelId } =
          await getYoutubeChannelInfo(tokens);
        const supabase = createClient();
        const currentUser = await supabase.auth.getUser();
        const userId = currentUser.data.user?.id;

        if (!customUrl || !accessToken || !channelId || !userId) {
          logger.error(errorString, {
            error: "Essential channel details are missing or incomplete.",
            customUrl,
            accessToken,
            channelId,
            userId,
          });
          return NextResponse.redirect(
            `${origin}/accounts?error=Sorry, something unexpected happened. Our team is looking into it.`
          );
        }

        const isAlreadySaved = await checkIfYoutubeChannelIsAlreadySaved({
          channelId,
          userId,
        });

        if (isAlreadySaved) {
          logger.info("Youtube channel already saved");
          return NextResponse.redirect(`${origin}/accounts`);
        }

        if (!userId) {
          logger.error(errorString, { error: "No user found." });
          return NextResponse.redirect(
            `${origin}/accounts?error=Sorry, something unexpected happened. Our team is looking into it.`
          );
        }
        const { error } = await supabase.from("youtube-channels").insert({
          credentials: { ...tokens },
          channel_custom_url: customUrl,
          id: channelId,
          user_id: userId,
        });
        if (error) {
          logger.error(errorString, { error: error.message });
          return NextResponse.redirect(
            `${origin}/accounts?error=${error.message}`
          );
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

const checkIfYoutubeChannelIsAlreadySaved = async ({
  channelId,
  userId,
}: {
  channelId: string;
  userId: string;
}) => {
  const logger = new Logger().with({
    function: "checkIfYoutubeChannelIsAlreadySaved",
    channelId,
    userId,
  });
  try {
    const supabase = createClient();
    logger.info(startingFunctionString);
    const { data, error } = await supabase
      .from("youtube-channels")
      .select("*")
      .eq("id", channelId)
      .eq("user_id", userId);
    if (error) {
      logger.error(errorString, error);
      await logger.flush();
      throw error;
    }
    logger.info(endingFunctionString);
    await logger.flush();
    return data.length > 0;
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    await logger.flush();
    throw error;
  }
};
