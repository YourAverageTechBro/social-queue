"use server";

import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import { FacebookGraphError } from "@/utils/facebookSdk";

const bucketName = process.env.SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET;

export const uploadSocialMediaPost = async (prevState: any, data: FormData) => {
  const logger = new Logger().with({
    function: "uploadSocialMediaPost",
  });
  const userId = data.get("userId") as string;
  const file = data.get("mediaFile") as File;
  const caption = data.get("caption") as string;
  const instagramBusinessAccountIds = (
    data.get("instagramBusinessAccountIds") as string
  ).split(",");
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
        });
        await checkInstagramContainerStatus({
          containerId: instagramMediaContainerId,
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
    logger.error("No data returned from social-media-posts insert");
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
    logger.error("No bucket name found in environment variables");
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
}: {
  instagramBusinessAccountId: string;
  filePath: string;
  caption: string;
  userId: string;
}) => {
  let logger = new Logger().with({
    function: "createInstagramContainer",
    instagramBusinessAccountId,
    filePath,
    caption,
    userId,
  });
  const accessToken = await fetchAccessTokenForInstagramBusinessAccountId({
    instagramBusinessAccountId,
    userId,
  });

  if (!bucketName) {
    logger.error("No bucket name found in environment variables");
    await logger.flush();
    throw new Error("No bucket name found in environment variables");
  }
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 60);
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    throw error;
  }
  if (!data) {
    logger.error("No signed url returned for file");
    await logger.flush();
    throw new Error("No signed url returned for file");
  }
  const graphUrl = `https://graph.facebook.com/v${
    process.env.FACEBOOK_GRAPH_API_VERSION
  }/${instagramBusinessAccountId}/media?video_url=${
    data.signedUrl
  }&caption=${encodeURIComponent(
    caption
  )}&access_token=${accessToken}&media_type=REELS`;
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

const checkInstagramContainerStatus = async ({
  containerId,
  instagramBusinessAccountId,
  userId,
}: {
  containerId: string;
  instagramBusinessAccountId: string;
  userId: string;
}) => {
  let logger = new Logger().with({
    function: "checkInstagramContainerStatus",
    containerId,
    instagramBusinessAccountId,
    userId,
  });

  const accessToken = await fetchAccessTokenForInstagramBusinessAccountId({
    instagramBusinessAccountId,
    userId,
  });

  let statusCode:
    | "EXPIRED"
    | "ERROR"
    | "FINISHED"
    | "IN_PROGRESS"
    | "PUBLISHED"
    | null = null;

  const graphUrl = `https://graph.facebook.com/v${process.env.FACEBOOK_GRAPH_API_VERSION}/${containerId}?fields=status_code&access_token=${accessToken}`;
  logger = logger.with({ graphUrl });
  while (statusCode != "FINISHED") {
    const resp = await fetch(graphUrl, {
      method: "GET",
    });
    const { error, status_code } = (await resp.json()) as {
      error: FacebookGraphError;
      status_code:
        | "EXPIRED"
        | "ERROR"
        | "FINISHED"
        | "IN_PROGRESS"
        | "PUBLISHED";
    };
    statusCode = status_code;
    if (error) {
      logger.error(errorString, error);
      await logger.flush();
      throw new Error("Failed checking media container status");
    }

    logger.info("Checked media container status", { statusCode });
    await new Promise((resolve) => setTimeout(resolve, 3000)); // wait for 3 seconds
    // TODO Error handle different status_codes
  }
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
  const graphUrl = `https://graph.facebook.com/v${process.env.FACEBOOK_GRAPH_API_VERSION}/${instagramBusinessAccountId}/media_publish?creation_id=${instagramMediaContainerId}&access_token=${accessToken}`;
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
    logger.error("No data returned from instagram-accounts select");
    await logger.flush();
    throw new Error("No data returned from instagram-accounts select");
  }
  if (data.length === 0) {
    logger.error("No data returned from instagram-accounts select");
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
