"use server";
import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";
import { buildGraphAPIURL, FacebookGraphError } from "@/utils/facebookSdk";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { fetchAccessTokenForInstagramBusinessAccountId } from "./socialMediaPosts";

export const saveInstagramAccount = async ({
  appScopedUserId,
  accessToken,
  instagramBusinessAccountId,
  facebookPageId,
  userId,
}: {
  appScopedUserId: string;
  accessToken: string;
  instagramBusinessAccountId: string;
  facebookPageId: string;
  userId: string;
}) => {
  let logger = new Logger().with({
    appScopedUserId,
    accessToken,
    instagramBusinessAccountId,
    facebookPageId,
    userId,
    function: "saveInstagramAccount",
  });
  try {
    const supabase = createClient();
    const { error } = await supabase.from("instagram-accounts").insert({
      facebook_page_id: facebookPageId,
      instagram_business_account_id: instagramBusinessAccountId,
      access_token: accessToken,
      user_id: userId,
    });
    if (error) {
      logger.error(errorString, error);
      await logger.flush();
      return {
        error:
          "Sorry, we ran into an error connecting your Instagram account. Please try again.",
      };
    }
  } catch (error) {
    await logger.flush();
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    return {
      error:
        "Sorry, we ran into an error connecting your Instagram account. Please try again.",
    };
  } finally {
    await logger.flush();
  }

  revalidatePath("/accounts");
  return {
    data: {
      message: "Successfully added Instagram account",
      instagramBusinessAccountId,
    },
    error: null,
  };
};

export const deleteInstagramAccount = async (
  prevState: any,
  data: FormData
) => {
  const instagramBusinessAccountId = data.get(
    "instagramBusinessAccountId"
  ) as string;
  const userId = data.get("userId") as string;
  const logger = new Logger().with({
    instagramBusinessAccountId,
    userId,
  });
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from("instagram-accounts")
      .delete()
      .eq("instagram_business_account_id", instagramBusinessAccountId);
    if (error) {
      logger.error(errorString, error);
      await logger.flush();
      return {
        error:
          "Sorry, we ran into an error deleting your Instagram account. Please try again.",
      };
    }

    const { error: storageError } = await supabase.storage
      .from(
        process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET!
      )
      .remove([`${userId}/instagramAccount/${instagramBusinessAccountId}`]);
    if (storageError) {
      logger.error(errorString, storageError);
      await logger.flush();
      return {
        error:
          "Sorry, we ran into an error deleting your Instagram account. Please try again.",
      };
    }
  } catch (error) {
    await logger.flush();
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    return {
      error:
        "Sorry, we ran into an error deleting your Instagram account. Please try again.",
    };
  } finally {
    await logger.flush();
  }
  revalidatePath("/accounts");
  return {
    data: "Successfully deleted Instagram account",
    error: null,
  };
};

export const fetchInstagramUsernameFromPageId = async ({
  instagramBusinessAccountId,
  accessToken,
}: {
  instagramBusinessAccountId: string;
  accessToken: string;
}) => {
  const logger = new Logger().with({
    function: "fetchInstagramUsernameFromPageId",
    instagramBusinessAccountId,
    accessToken,
  });
  const fields = "username,profile_picture_url";
  const graphUrl = buildGraphAPIURL({
    path: `/${instagramBusinessAccountId}`,
    searchParams: { fields },
    accessToken,
  });
  const response = await fetch(graphUrl);
  const data = (await response.json()) as {
    error: FacebookGraphError;
    username: string;
    profile_picture_url: string;
  };
  logger.info("Fetched Instagram account data", data);
  if (data.error) {
    logger.error(errorString, data.error);
    await logger.flush();
    throw new Error("Failed fetching Instagram business account from page id");
  }
  await logger.flush();
  return data;
};

const fetchLongLivedAccessToken = async (shortLivedAccessToken: string) => {
  const logger = new Logger().with({
    function: "fetchLongLivedAccessToken",
    shortLivedAccessToken,
  });
  const response = await fetch(
    `https://graph.facebook.com/v${process.env.FACEBOOK_GRAPH_API_VERSION}/oauth/access_token?
      grant_type=fb_exchange_token&client_id=${process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}&
      client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&
      fb_exchange_token=${shortLivedAccessToken}`,
    {
      method: "GET",
    }
  );
  const data = (await response.json()) as {
    error: FacebookGraphError;
    access_token: string;
  };
  logger.info("Fetched long lived access token", data);
  if (data.error) {
    logger.error(errorString, data.error);
    await logger.flush();
    throw new Error("Failed fetching long lived access token");
  }
  await logger.flush();
  return {
    longLivedAccessToken: data.access_token,
  };
};

export const fetchInstagramPublishingRateLimit = async ({
  instagramBusinessAccountId,
  userId,
}: {
  instagramBusinessAccountId: string;
  userId: string;
}) => {
  const logger = new Logger().with({
    function: "fetchInstagramPublishingRateLimit",
    instagramBusinessAccountId,
    userId,
  });
  const accessToken = await fetchAccessTokenForInstagramBusinessAccountId({
    instagramBusinessAccountId,
    userId,
  });
  const graphUrl = buildGraphAPIURL({
    path: `/${instagramBusinessAccountId}/content_publishing_limit`,
    searchParams: { fields: "config,quota_usage" },
    accessToken,
  });

  const resp = await fetch(graphUrl, {
    method: "GET",
  });

  const { error: facebookGraphError, data } = (await resp.json()) as {
    error: FacebookGraphError;
    data: {
      config: {
        quota_total: number;
      };
      quota_usage: number;
    }[];
  };

  logger.info("Fetched instagram rate limit", {
    ...data,
    ...facebookGraphError,
  });
  if (facebookGraphError) {
    logger.error(errorString, { ...facebookGraphError });
    await logger.flush();
    throw new Error("Failed creating carousel container");
  }
  if (data.length === 0) {
    logger.error(errorString, {
      error: "No data found in response from Facebook Graph API",
    });
    await logger.flush();
    throw new Error("Failed creating carousel container");
  }
  await logger.flush();
  return data[0];
};
