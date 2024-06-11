import VideoUploadComponent from "@/app/create-post/VideoUploadComponent";
import { getUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { fetchUserConnectSocialMediaAccounts } from "../actions/socialMediaAccounts";

export const maxDuration = 300;

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
