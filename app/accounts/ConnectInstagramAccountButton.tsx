import Icons from "@/components/common/Icons";
import { saveInstagramAccounts, loginToFacebook } from "@/utils/facebookSdk";
import { useLogger } from "next-axiom";

export default function ConnectInstagramAccountButton({
  userId,
}: {
  userId: string;
}) {
  const logger = useLogger();
  const facebookLoginCallback = (res: fb.StatusResponse) => {
    if (res.status === "connected") {
      const appScopedUserId = res.authResponse.userID;
      saveInstagramAccounts({
        appScopedUserId,
        logger,
        userId,
      });
    }
  };
  return (
    <button
      onClick={() => {
        loginToFacebook(facebookLoginCallback, {
          scope:
            "business_management,pages_show_list,instagram_basic,instagram_content_publish",
        });
      }}
      className="p-2 rounded-full flex items-center gap-2 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 text-white"
    >
      <Icons.instagram className="h-6 w-6 inline-block" />
      <p className="font-bold text-gray-100"> Connect Instagram Account</p>
    </button>
  );
}
