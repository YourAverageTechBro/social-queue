import VideoUploadComponent from "@/app/create-post/VideoUploadComponent";
import { getUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";

export const maxDuration = 300;

const fetchUserConnectSocialMediaAccounts = async (userId: string) => {
  const logger = new Logger().with({
    userId,
    function: "fetchUserConnectSocialMediaAccounts",
  });
  const supabase = createClient();
  const { data: instagramAccounts, error: instagramAccountError } =
    await supabase.from("instagram-accounts").select("*").eq("user_id", userId);
  if (instagramAccountError) {
    logger.error(errorString, instagramAccountError);
  }
  const { data: youtubeChannels, error: youtubeChannelError } = await supabase
    .from("youtube-channels")
    .select("*")
    .eq("user_id", userId);
  if (youtubeChannelError) {
    logger.error(errorString, youtubeChannelError);
  }
  return {
    instagramAccounts: instagramAccounts ?? [],
    youtubeChannels: youtubeChannels ?? [],
  };
};

export default async function PostPage() {
  const { user } = await getUser();
  if (!user) {
    redirect("/login");
  }
  const { instagramAccounts, youtubeChannels } =
    await fetchUserConnectSocialMediaAccounts(user.id);

  return (
    <VideoUploadComponent
      instagramAccounts={instagramAccounts}
      userId={user.id}
      youtubeChannels={youtubeChannels}
    />
  );
}
