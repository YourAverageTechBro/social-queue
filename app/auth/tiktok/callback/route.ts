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
    const userInfo = await fetchTikTokUserInfo(access_token, logger);
    const profilePicturePath = await uploadTikTokProfilePicture({
      userId: userId,
      accountId: open_id,
      pictureUrl: userInfo.avatar_url,
      logger,
    });

    const { error: userError } = await supabase.from("tiktok-accounts").insert({
      id: open_id,
      access_token: access_token,
      refresh_token: refresh_token,
      user_id: userId,
      profile_picture_file_path: profilePicturePath,
      account_name: userInfo.username,
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
});

export const fetchTikTokUserInfo = async (
  accessToken: string,
  logger: Logger
) => {
  logger = logger.with({
    function: "fetchTikTokUserInfo",
  });
  logger.info("fetching tiktok user info");
  const response = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = (await response.json()) as {
    data?: {
      user: TikTokUserInfo;
    };
    error?: {
      code: number;
      message: string;
    };
  };
  logger.info("Fetched user from tiktok", {
    data,
  });
  if (!response.ok) {
    logger.error("Failed to fetch user info", {
      ...data.error,
    });

    throw Error("Failed to fetch user info from TikTok");
  }
  const user = data.data?.user;
  if (!user || !user.open_id) {
    logger.error("No user info found", {
      ...data.error,
    });
    throw Error("No user info found");
  }
  return user;
};

export const uploadTikTokProfilePicture = async ({
  userId,
  accountId,
  pictureUrl,
  logger,
}: {
  userId: string;
  accountId: string;
  pictureUrl: string;
  logger: Logger;
}) => {
  logger = logger.with({
    function: "uploadTikTokProfilePicture",
    userId,
    accountId,
    pictureUrl,
  });
  const supabase = createClient();

  const bucketName =
    process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET;

  if (!bucketName) {
    logger.error(errorString, {
      error: "No bucket name found in environment",
    });

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

    throw new Error("Failed to download or create file from URL");
  }

  const filePath = `${userId}/tiktokAccount/${accountId}/profile_picture.${
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

type TikTokUserInfo = {
  open_id: string;
  union_id: string;
  avatar_url: string;
  avatar_url_100: string;
  avatar_large_url: string;
  display_name: string;
  bio_description: string;
  profile_deep_link: string;
  is_verified: boolean;
  username: string;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
};
