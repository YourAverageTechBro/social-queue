import { createClient } from "@/utils/supabase/server";
import { AxiomRequest, Logger, withAxiom } from "next-axiom";
import { errorString, startingFunctionString } from "@/utils/logging";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const GET = withAxiom(async (request: AxiomRequest) => {
  const requestUrl = new URL(request.url);
  const code = decodeURIComponent(requestUrl.searchParams.get("code") || "");
  const origin = requestUrl.origin;
  const logger = request.log.with({
    method: "GET",
    path: "/auth/tiktok/callback",
    code,
    origin,
  });
  try {
    const supabase = createClient();
    const currentUser = await supabase.auth.getUser();
    const userId = currentUser.data.user?.id;
    if (!userId) {
      logger.error(errorString, { error: "No user found." });
      throw Error("No user found");
    }
    const response = await fetch(
      `https://open.tiktokapis.com/v2/oauth/token/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `code=${code}&client_key=${process.env.TIKTOK_CLIENT_KEY}&client_secret=${process.env.TIKTOK_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=https://socialqueue.ai/auth/tiktok/callback`,
      }
    );
    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      open_id?: string;
      refresh_expires_in?: number;
      refresh_token?: string;
      scope?: string;
      token_type?: string;
      error?: string;
      error_description?: string;
    };
    if (!response.ok) {
      logger.error(errorString, {
        error: data.error,
        error_description: data.error_description,
      });
      throw Error("Failed to get access token from TikTok");
    }
    logger.info("Got response from tiktok", {
      data,
    });
    const { access_token, refresh_token, open_id } = data;
    if (!access_token || !refresh_token || !open_id) {
      logger.error(errorString, {
        error: "No access token, refresh token, or open id",
        data: data,
      });

      throw Error("No access token, refresh token, or open id");
    }

    const { error: userError } = await supabase.from("tiktok-accounts").insert({
      id: open_id,
      access_token: access_token,
      refresh_token: refresh_token,
      user_id: userId,
    });
    if (userError) {
      logger.error(errorString, {
        error: userError,
      });
      throw userError;
    }
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    await logger.flush();
    redirect(
      "/accounts?error=We had trouble connecting your TikTok account. Please try again."
    );
  } finally {
    await logger.flush();
  }

  revalidatePath("/accounts");
  return NextResponse.redirect(`${origin}/accounts`);
});
