import { Logger } from "next-axiom";
import { createClient } from "./server";
import { errorString } from "../logging";

export const getSignedUrl = async ({
  bucketName,
  duration,
  filePath,
}: {
  bucketName: string;
  duration: number;
  filePath: string;
}) => {
  const logger = new Logger().with({
    function: "getSignedUrl",
    bucketName,
    duration,
    filePath,
  });
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, duration);
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
  return data.signedUrl;
};

export const socialMediaPostMediaFilesStorageBucket =
  process.env.NEXT_PUBLIC_SOCIAL_MEDIA_POST_MEDIA_FILES_STORAGE_BUCKET!;
