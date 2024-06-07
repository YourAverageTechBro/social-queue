import VideoUploadComponent from "@/app/create-post/VideoUploadComponent";
import { getUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";

export const maxDuration = 300;

const fetchUserConnectSocialMediaAccounts = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("instagram-accounts")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    const logger = new Logger().with({
      userId,
      function: "fetchUserConnectSocialMediaAccounts",
    });
    logger.error(errorString, error);
  }
  return {
    instagramAccounts: data ?? [],
  };
};

export default async function PostPage() {
  const { user } = await getUser();
  if (!user) {
    redirect("/login");
  }
  const { instagramAccounts } = await fetchUserConnectSocialMediaAccounts(
    user.id
  );

  return (
    <VideoUploadComponent
      instagramAccounts={instagramAccounts}
      userId={user.id}
    />
  );
}
