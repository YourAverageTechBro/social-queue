import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/user";
import Dashboard from "@/app/accounts/Dashboard";
import { fetchUserConnectSocialMediaAccounts } from "../actions/socialMediaAccounts";

export default async function Page() {
  const { user } = await getUser();
  if (!user) {
    redirect("/login");
  }

  const { instagramAccounts, youtubeChannels } =
    await fetchUserConnectSocialMediaAccounts(user.id);

  return (
    <Dashboard
      userId={user.id}
      instagramAccounts={instagramAccounts}
      youtubeChannels={youtubeChannels}
    />
  );
}
