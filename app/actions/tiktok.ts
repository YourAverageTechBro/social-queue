"use server";

import { errorString, startingFunctionString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import { Logger } from "next-axiom";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as crypto from "node:crypto";

export const loginWithTikTok = async () => {
  // const csrfState = Math.random().toString(36).substring(2);

  const codeVerifier = generateRandomString(128);
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("hex");

  let url = "https://www.tiktok.com/v2/auth/authorize/";

  // the following params need to be in `application/x-www-form-urlencoded` format.
  url += `?client_key=${process.env.TIKTOK_CLIENT_KEY}`;
  url += "&scope=user.info.profile,user.info.stats,video.publish,video.upload";
  url += "&response_type=code";
  // url += `&redirect_uri=${headers().get("origin")}/accounts`;
  url += `&redirect_uri=https://socialqueue.ai/auth/tiktok/callback`;
  url += `&code_challenge=${codeChallenge}`;
  url += "&code_challenge_method=S256";
  redirect(url);
};

const generateRandomString = (length: number) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const deleteTikTokAccount = async (prevState: any, data: FormData) => {
  const userId = data.get("userId") as string;
  const tiktokAccountId = data.get("tiktokAccountId") as string;
  const logger = new Logger().with({
    function: "deleteTikTokAccount",
    userId,
    tiktokAccountId,
  });
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("tiktok-accounts")
      .delete()
      .eq("user_id", userId)
      .eq("id", tiktokAccountId);
    if (error) {
      logger.error(errorString, error);
      return {
        error:
          "Sorry, we ran into an error deleting your TikTok account. Please try again.",
      };
    }

    const { error: storageError } = await supabase.storage
      .from(
        process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET!
      )
      .remove([`${userId}/tiktokAccount/${tiktokAccountId}`]);
    if (storageError) {
      logger.error(errorString, storageError);

      return {
        error:
          "Sorry, we ran into an error deleting your TikTok account. Please try again.",
      };
    }
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });

    return {
      error:
        "Sorry, we ran into an error deleting your TikTok account. Please try again.",
    };
  }
  revalidatePath("/accounts");
  return {
    data: "Successfully deleted TikTok account",
    error: null,
  };
};
