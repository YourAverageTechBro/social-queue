import { errorString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import youtubeAuthClient from "@/utils/youtube";
import { google } from "googleapis";
import { AxiomRequest, withAxiom } from "next-axiom";
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
      service.channels.list(
        {
          auth: youtubeAuthClient,
          part: ["snippet", "contentDetails", "statistics"],
          mine: true,
        },
        async (err, response) => {
          if (err) {
            logger.error(errorString, {
              error: err instanceof Error ? err.message : String(err),
            });

            return NextResponse.redirect(
              `${origin}/accounts?error=${
                err instanceof Error ? err.message : String(err)
              }`
            );
          }
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

            if (!customUrl || !thumbnail) {
              logger.error(errorString, {
                error: "No customUrl or thumbnail found.",
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
            const { error } = await supabase.from("youtube-channels").upsert({
              channel_custom_url: customUrl,
              profile_picture_path: thumbnail,
              id: channels[0].id,
              access_token: tokens.access_token,
              user_id: userId,
            });
            if (error) {
              logger.error(errorString, { error: error.message });
              return NextResponse.redirect(
                `${origin}/accounts?error=${error.message}`
              );
            }
          }
        }
      );
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

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/accounts`);
});
