"use server";

import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import { FacebookGraphError } from "@/utils/facebookSdk";
import { postVideoToYoutube } from "./youtube";

const bucketName = process.env.SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET;

type PostType = "video" | "image";

export const processSocialMediaPost = async (data: FormData) => {
  const userId = data.get("userId") as string;
  const numberOfFiles = parseInt(data.get("numberOfFiles") as string);
  let files = [];
  for (let i = 0; i < numberOfFiles; i++) {
    files.push(data.get(`file${i}`) as File);
  }
  const caption = data.get("caption") as string;
  const youtubeTitle = data.get("youtubeTitle") as string;
  const instagramBusinessAccountIds = (
    data.get("instagramBusinessAccountIds") as string | null
  )?.split(",");
  const youtubeChannelIds = (
    data.get("youtubeChannelIds") as string | null
  )?.split(",");
  const logger = new Logger().with({
    function: "processSocialMediaPost",
    numberOfFiles,
    userId,
    caption,
    instagramBusinessAccountIds,
  });
  if (files.length === 1) {
    logger.info("Uploading single social media post");
    return await uploadSingleSocialMediaPost({
      userId,
      file: files[0],
      caption,
      instagramBusinessAccountIds: instagramBusinessAccountIds ?? [],
      postType: files[0].type.includes("video") ? "video" : "image",
      youtubeChannelIds: youtubeChannelIds ?? [],
      youtubeTitle,
    });
  } else if (files.length > 1) {
    logger.info("Uploading social media carousel post");
    return uploadSocialMediaCarouselPost({
      userId,
      files,
      caption,
      instagramBusinessAccountIds: instagramBusinessAccountIds ?? [],
    });
  } else {
    logger.error(errorString, { error: "No files found in request" });
    await logger.flush();
    return {
      error: "Sorry, something went wrong. Our team is looking into it.",
    };
  }
};

export const uploadSocialMediaCarouselPost = async ({
  userId,
  files,
  caption,
  instagramBusinessAccountIds,
}: {
  userId: string;
  files: File[];
  caption: string;
  instagramBusinessAccountIds: string[];
}) => {
  const logger = new Logger().with({
    function: "uploadSocialMediaCarouselPost",
    userId,
    caption,
    instagramBusinessAccountIds,
  });
  let socialMediaPostId = "";
  let filePaths: { filePath: string; postType: PostType }[] = [];

  const supabase = createClient();

  try {
    socialMediaPostId = await createSocialMediaPost(userId);
    filePaths = await Promise.all(
      files.map(async (file, index) => {
        return {
          filePath: await uploadSocialMediaPostFile({
            userId,
            file,
            index,
            postId: socialMediaPostId,
          }),
          postType: file.type.includes("video") ? "video" : "image",
        };
      })
    );
    await Promise.all(
      instagramBusinessAccountIds.map(async (instagramBusinessAccountId) => {
        const instagramCarouselMediaContainerIds = await Promise.all(
          filePaths.map(({ filePath, postType }) =>
            createInstagramContainer({
              instagramBusinessAccountId,
              filePath,
              userId,
              postType,
              isCarouselItem: true,
            })
          )
        );
        await checkInstagramContainerStatus({
          containerIds: instagramCarouselMediaContainerIds,
          instagramBusinessAccountId,
          userId,
        });
        const instagramMediaContainerId =
          await createInstagramCarouselContainer({
            instagramCarouselMediaContainerIds,
            instagramBusinessAccountId,
            userId,
            caption,
          });
        await checkInstagramContainerStatus({
          containerIds: [instagramMediaContainerId],
          instagramBusinessAccountId,
          userId,
        });
        const instagramMediaId = await publishInstagramMediaContainer({
          instagramBusinessAccountId,
          instagramMediaContainerId,
          userId,
        });
        await saveInstagramId({
          instagramMediaId,
          parentSocialMediaPostId: socialMediaPostId,
          caption,
          userId,
        });
      })
    );
    return {
      data: "Your post has successfully been published to your social media accounts 🎉",
    };
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    await logger.flush();
    if (socialMediaPostId) {
      await supabase
        .from("social-media-posts")
        .delete()
        .eq("id", socialMediaPostId);
    }
    if (filePaths.length > 0) {
      await Promise.all(
        filePaths.map(async ({ filePath }) => {
          await supabase.storage.from(bucketName!).remove([filePath]);
        })
      );
    }
    return {
      error:
        "Sorry, we ran into an error uploading your social media post. Please try again.",
    };
  }
};

export const uploadSingleSocialMediaPost = async ({
  userId,
  file,
  caption,
  instagramBusinessAccountIds,
  postType,
  youtubeChannelIds,
  youtubeTitle,
}: {
  userId: string;
  file: File;
  caption?: string;
  instagramBusinessAccountIds: string[];
  postType: PostType;
  youtubeChannelIds: string[];
  youtubeTitle?: string;
}) => {
  const logger = new Logger().with({
    function: "uploadSingleSocialMediaPost",
    userId,
    caption,
    instagramBusinessAccountIds,
    postType,
    youtubeChannelIds,
  });
  let socialMediaPostId = "";
  let filePath = "";

  const supabase = createClient();

  try {
    socialMediaPostId = await createSocialMediaPost(userId);
    filePath = await uploadSocialMediaPostFile({
      userId,
      file,
      index: 0,
      postId: socialMediaPostId,
    });
    await Promise.all(
      instagramBusinessAccountIds.map(async (instagramBusinessAccountId) => {
        const instagramMediaContainerId = await createInstagramContainer({
          instagramBusinessAccountId,
          filePath,
          caption,
          userId,
          postType,
          isCarouselItem: false,
        });
        await checkInstagramContainerStatus({
          containerIds: [instagramMediaContainerId],
          instagramBusinessAccountId,
          userId,
        });
        const instagramMediaId = await publishInstagramMediaContainer({
          instagramBusinessAccountId,
          instagramMediaContainerId,
          userId,
        });
        await saveInstagramId({
          instagramMediaId,
          parentSocialMediaPostId: socialMediaPostId,
          caption: caption ?? "",
          userId,
        });
      })
    );
    await Promise.all(
      youtubeChannelIds.map(async (youtubeChannelId) => {
        await postVideoToYoutube({
          youtubeChannelId,
          video: file,
          title: youtubeTitle ?? "",
          userId,
          parentSocialMediaPostId: socialMediaPostId,
          youtubeTitle: youtubeTitle ?? "",
        });
      })
    );
    return {
      data: "Your post has successfully been published to your social media accounts 🎉",
    };
  } catch (error) {
    logger.error(errorString, {
      error: error instanceof Error ? error.message : JSON.stringify(error),
    });
    await logger.flush();
    if (socialMediaPostId) {
      await supabase
        .from("social-media-posts")
        .delete()
        .eq("id", socialMediaPostId);
    }
    if (filePath) {
      await supabase.storage.from(bucketName!).remove([filePath]);
    }
    return {
      error:
        "Sorry, we ran into an error uploading your social media post. Please try again.",
    };
  }
};

const createSocialMediaPost = async (userId: string) => {
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
    throw error;
  }
  if (!data) {
    logger.error(errorString, {
      error: "No data returned from social-media-posts insert",
    });
    await logger.flush();
    throw new Error("No data returned from social-media-posts insert");
  }
  logger.info("Social media post created", { socialMediaPostId: data[0].id });
  await logger.flush();
  return data[0].id;
};

const uploadSocialMediaPostFile = async ({
  userId,
  file,
  index,
  postId,
}: {
  userId: string;
  file: File;
  index: number;
  postId: string;
}) => {
  const logger = new Logger().with({
    function: "uploadSocialMediaPostFile",
    userId,
  });

  const supabase = createClient();
  if (!bucketName) {
    logger.error(errorString, {
      error: "No bucket name found in environment variables",
    });
    await logger.flush();
    throw new Error("No bucket name found in environment variables");
  }

  const filePath = `${userId}/${postId}/${index}.${
    file.name.split(".").pop() ?? file.name
  }`;

  // Upload file
  const { data: uploadResponse, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, { upsert: true });
  if (uploadError) {
    logger.error(errorString, uploadError);
    await logger.flush();
    throw uploadError;
  }
  if (!uploadResponse?.path) {
    logger.error(errorString, {
      error: "No file path found in response from Supabase",
    });
    await logger.flush();
    throw new Error("No file path found in response from Supabase");
  }

  const { error: insertError } = await supabase
    .from("social-media-post-media-files")
    .insert({
      media_file_path: uploadResponse.path,
      parent_social_media_post_id: postId,
      user_id: userId,
    });

  if (insertError) {
    logger.error(errorString, insertError);
    await logger.flush();
    throw insertError;
  }

  logger.info("Social media post file uploaded", { file: file.name });
  await logger.flush();
  return uploadResponse.path;
};

const createInstagramContainer = async ({
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
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 600);
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    throw error;
  }
  if (!data) {
    logger.error(errorString, { error: "No signed url returned for file" });
    await logger.flush();
    throw new Error("No signed url returned for file");
  }
  const videoSearchParams = {
    video_url: data.signedUrl,
    caption,
    media_type: "REELS",
  };
  const imageSearchParams = {
    image_url: data.signedUrl,
    caption,
  };
  let carouselSearchParams = {};
  if (postType === "video") {
    carouselSearchParams = {
      video_url: data.signedUrl,
      media_type: "REELS",
      is_carousel_item: true,
    };
  } else if (postType === "image") {
    carouselSearchParams = {
      is_carousel_item: true,
      image_url: data.signedUrl,
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
    error,
    id,
  });
  if (facebookGraphError) {
    logger.error(errorString, facebookGraphError);
    await logger.flush();
    throw new Error("Failed creating media container");
  }
  await logger.flush();
  return id;
};

const createInstagramCarouselContainer = async ({
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

const checkInstagramContainerStatus = async ({
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

      logger.info("Checked media container status", {
        containerId,
        statusCode,
      });
      await new Promise((resolve) => setTimeout(resolve, 10000)); // wait for 30 seconds
    }

    return statusCode;
  };

  // Run checkStatus for all containerIds concurrently
  const statusPromises = containerIds.map(checkStatus);
  await Promise.all(statusPromises);

  logger.info("All containers have finished processing", { containerIds });
  await logger.flush();
};

const publishInstagramMediaContainer = async ({
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

const saveInstagramId = async ({
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
