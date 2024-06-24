import { getUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import { fetchUserConnectSocialMediaAccounts } from "../actions/socialMediaAccounts";
import VideoUploadComponent from "./VideoUploadComponent";

export const maxDuration = 300;

export default async function PostPage() {
  const { user } = await getUser();
  if (!user) {
    redirect("/login");
  }
  const { instagramAccounts, tiktokAccounts, youtubeChannels } =
    await fetchUserConnectSocialMediaAccounts(user.id);

  return (
    <div className="flex flex-col items-center w-[1024px]">
      <VideoUploadComponent
        instagramAccounts={instagramAccounts}
        userId={user.id}
        tiktokAccounts={tiktokAccounts}
        youtubeChannels={youtubeChannels}
      />
    </div>
  );
}
