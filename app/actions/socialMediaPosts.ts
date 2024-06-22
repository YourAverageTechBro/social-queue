"use server";

import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import { FacebookGraphError } from "@/utils/facebookSdk";
import { getSignedUrl } from "@/utils/supabase/storage";

const bucketName =
  process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET;

type PostType = "video" | "image";

export const createSocialMediaPost = async (userId: string) => {
  const logger = new Logger().with({
    function: "createSocialMediaPost",
    userId,
  });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("social-media-posts")
    .insert({
      user_id: userId,
    })
    .select("id");
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    throw new Error(
      "Sorry, we had an issue creating your post. Please try again."
    );
  }
  if (!data) {
    logger.error(errorString, {
      error: "No data returned from social-media-posts insert",
    });
    await logger.flush();
    throw new Error(
      "Sorry, we had an issue creating your post. Please try again."
    );
  }
  logger.info("Social media post created", { socialMediaPostId: data[0].id });
  await logger.flush();
  return data[0].id;
};

export const createInstagramContainer = async ({
  instagramBusinessAccountId,
  filePath,
  caption,
  userId,
  postType,
  isCarouselItem,
}: {
  instagramBusinessAccountId: string;
  filePath: string;
  caption?: string;
  userId: string;
  postType: PostType;
  isCarouselItem: boolean;
}) => {
  let logger = new Logger().with({
    function: "createInstagramContainer",
    instagramBusinessAccountId,
    filePath,
    caption,
    userId,
    postType,
    isCarouselItem,
  });
  const accessToken = await fetchAccessTokenForInstagramBusinessAccountId({
    instagramBusinessAccountId,
    userId,
  });

  if (!bucketName) {
    logger.error(errorString, {
      error: "No bucket name found in environment variables",
    });
    await logger.flush();
    throw new Error("No bucket name found in environment variables");
  }
  const signedUrl = await getSignedUrl({
    bucketName,
    duration: 600,
    filePath,
  });
  const videoSearchParams = {
    video_url: signedUrl,
    caption,
    media_type: "REELS",
  };
  const imageSearchParams = {
    image_url: signedUrl,
    caption,
  };
  let carouselSearchParams = {};
  if (postType === "video") {
    carouselSearchParams = {
      video_url: signedUrl,
      media_type: "REELS",
      is_carousel_item: true,
    };
  } else if (postType === "image") {
    carouselSearchParams = {
      is_carousel_item: true,
      image_url: signedUrl,
    };
  }
  let finalSearchParams = null;
  if (isCarouselItem) {
    finalSearchParams = carouselSearchParams;
  } else if (postType === "video") {
    finalSearchParams = videoSearchParams;
  } else if (postType === "image") {
    finalSearchParams = imageSearchParams;
  }
  logger = logger.with({ finalSearchParams });
  if (!finalSearchParams) {
    logger.error(errorString, {
      error: "No search params found for post type",
    });
    await logger.flush();
    throw new Error("No search params found for post type");
  }
  const graphUrl = buildGraphAPIURL({
    path: `/${instagramBusinessAccountId}/media`,
    searchParams: finalSearchParams,
    accessToken,
  });
  logger = logger.with({ graphUrl });
  const resp = await fetch(graphUrl, {
    method: "POST",
  });

  const { error: facebookGraphError, id } = (await resp.json()) as {
    error: FacebookGraphError;
    id: string;
  };
  logger.info("Creating media container", {
    id,
  });
  if (facebookGraphError) {
    logger.error(errorString, facebookGraphError);
    await logger.flush();
    throw new Error(`Error: ${facebookGraphError.message}`);
  }
  await logger.flush();
  return id;
};

export const createInstagramCarouselContainer = async ({
  instagramCarouselMediaContainerIds,
  instagramBusinessAccountId,
  userId,
  caption,
}: {
  instagramCarouselMediaContainerIds: string[];
  instagramBusinessAccountId: string;
  userId: string;
  caption: string;
}) => {
  const accessToken = await fetchAccessTokenForInstagramBusinessAccountId({
    instagramBusinessAccountId,
    userId,
  });
  let logger = new Logger().with({
    function: "createInstagramCarouselContainer",
    instagramCarouselMediaContainerIds,
    instagramBusinessAccountId,
    userId,
    caption,
  });

  const graphUrl = buildGraphAPIURL({
    path: `/${instagramBusinessAccountId}/media`,
    searchParams: {
      caption,
      media_type: "CAROUSEL",
      children: instagramCarouselMediaContainerIds.join(","),
    },
    accessToken,
  });

  logger = logger.with({ graphUrl });

  const resp = await fetch(graphUrl, {
    method: "POST",
  });

  const { error: facebookGraphError, id } = (await resp.json()) as {
    error: FacebookGraphError;
    id: string;
  };

  if (facebookGraphError) {
    logger.error(errorString, facebookGraphError);
    await logger.flush();
    throw new Error("Failed creating carousel container");
  }
  await logger.flush();
  return id;
};

type StatusCode =
  | "EXPIRED"
  | "ERROR"
  | "FINISHED"
  | "IN_PROGRESS"
  | "PUBLISHED"
  | null;

export const checkInstagramContainerStatus = async ({
  containerIds,
  instagramBusinessAccountId,
  userId,
}: {
  containerIds: string[];
  instagramBusinessAccountId: string;
  userId: string;
}) => {
  let logger = new Logger().with({
    function: "checkInstagramContainerStatus",
    containerIds,
    instagramBusinessAccountId,
    userId,
  });

  const accessToken = await fetchAccessTokenForInstagramBusinessAccountId({
    instagramBusinessAccountId,
    userId,
  });

  const checkStatus = async (containerId: string): Promise<StatusCode> => {
    let numberOfPolls = 0;
    const maxNumberOfPolls = 15;
    let statusCode: StatusCode = null;

    const graphUrl = buildGraphAPIURL({
      path: `/${containerId}`,
      searchParams: {
        fields: "status_code",
      },
      accessToken,
    });

    while (statusCode !== "FINISHED") {
      const resp = await fetch(graphUrl, {
        method: "GET",
      });
      const {
        error,
        status_code,
      }: { error: FacebookGraphError; status_code: StatusCode } =
        await resp.json();

      statusCode = status_code;

      if (error) {
        logger.error("Failed checking media container status", error);
        await logger.flush();
        throw new Error("Failed checking media container status");
      }
      if (statusCode === "ERROR") {
        logger.error("Media container processing failed", {
          containerId,
          status_code,
        });
        await logger.flush();
        throw new Error("Media container processing failed");
      }
      if (statusCode === "EXPIRED") {
        logger.error("Media container processing expired", {
          containerId,
          status_code,
        });
        await logger.flush();
        throw new Error("Media container processing expired");
      }
      if (numberOfPolls > maxNumberOfPolls) {
        logger.error("Status check timed out", {
          containerId,
        });
        await logger.flush();
        throw new Error("Status check timed out");
      }

      logger.info("Checked media container status", {
        containerId,
        statusCode,
      });
      numberOfPolls++;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }

    logger.info("Returning status code", { statusCode });
    await logger.flush();
    return statusCode;
  };

  // Run checkStatus for all containerIds concurrently
  const statusPromises = containerIds.map(checkStatus);
  await Promise.all(statusPromises);

  logger.info("All containers have finished processing", { containerIds });
  await logger.flush();
};

export const publishInstagramMediaContainer = async ({
  instagramBusinessAccountId,
  instagramMediaContainerId,
  userId,
}: {
  instagramBusinessAccountId: string;
  instagramMediaContainerId: string;
  userId: string;
}) => {
  let logger = new Logger().with({
    function: "publishInstagramMediaContainer",
    instagramBusinessAccountId,
    instagramMediaContainerId,
    userId,
  });

  const accessToken = await fetchAccessTokenForInstagramBusinessAccountId({
    instagramBusinessAccountId,
    userId,
  });
  const graphUrl = buildGraphAPIURL({
    path: `/${instagramBusinessAccountId}/media_publish`,
    searchParams: {
      creation_id: instagramMediaContainerId,
    },
    accessToken,
  });
  logger = logger.with({ graphUrl });
  const resp = await fetch(graphUrl, {
    method: "POST",
  });

  const { error, id } = (await resp.json()) as {
    error: FacebookGraphError;
    id: string;
  };
  logger.info("Creating media container", {
    error,
    id,
  });
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    throw new Error("Failed publishing media container");
  }
  await logger.flush();
  return id;
};

const fetchAccessTokenForInstagramBusinessAccountId = async ({
  instagramBusinessAccountId,
  userId,
}: {
  instagramBusinessAccountId: string;
  userId: string;
}) => {
  const logger = new Logger().with({
    function: "fetchAccessTokenForInstagramBusinessAccountId",
    instagramBusinessAccountId,
    userId,
  });
  const supabase = createClient();
  const { data, error } = await supabase
    .from("instagram-accounts")
    .select("access_token")
    .eq("instagram_business_account_id", instagramBusinessAccountId)
    .eq("user_id", userId);
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    throw error;
  }

  if (!data) {
    logger.error(errorString, {
      error: "No data returned from instagram-accounts select",
    });
    await logger.flush();
    throw new Error("No data returned from instagram-accounts select");
  }
  if (data.length === 0) {
    logger.error(errorString, {
      error: "No data returned from instagram-accounts select",
    });
    await logger.flush();
    throw new Error("No data returned from instagram-accounts select");
  }
  logger.info("Access token retrieved", { accessToken: data[0].access_token });
  await logger.flush();
  return data[0].access_token;
};

export const saveInstagramId = async ({
  instagramMediaId,
  parentSocialMediaPostId,
  caption,
  userId,
}: {
  instagramMediaId: string;
  parentSocialMediaPostId: string;
  caption: string;
  userId: string;
}) => {
  const logger = new Logger().with({
    function: "saveInstagramId",
    instagramMediaId,
    caption,
    userId,
  });
  const supabase = createClient();
  const { error } = await supabase.from("instagram-posts").insert({
    instagram_media_id: instagramMediaId,
    parent_social_media_post_id: parentSocialMediaPostId,
    caption,
    user_id: userId,
  });
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    throw error;
  }
  logger.info("Instagram media id saved");
  await logger.flush();
};

const GRAPH_API_BASE_URL = `https://graph.facebook.com/v${process.env.FACEBOOK_GRAPH_API_VERSION}`;

const buildGraphAPIURL = ({
  path,
  searchParams,
  accessToken,
}: {
  path: string;
  searchParams: Record<string, string | null | undefined>;
  accessToken?: string;
}): string => {
  const url = new URL(path, GRAPH_API_BASE_URL);

  Object.keys(searchParams).forEach((key) => {
    if (!searchParams[key]) {
      delete searchParams[key];
    }
  });

  url.search = new URLSearchParams(
    searchParams as Record<string, string>
  ).toString();

  if (accessToken) {
    url.searchParams.append("access_token", accessToken);
  }

  return url.toString();
};
