import { Button } from "@/components/common/Button";
import Icons from "@/components/common/Icons";
import {
  getInstagramAccountId,
  InstagramAccount,
  loginToFacebook,
} from "@/utils/facebookSdk";
import { useLogger } from "next-axiom";

export default function ConnectFacebookAccountButton({
  setAppScopedUserId,
  setInstagramAccounts,
}: {
  setAppScopedUserId: (appScopedUserId: string) => void;
  setInstagramAccounts: (instagramAccounts: InstagramAccount[]) => void;
}) {
  const logger = useLogger();
  const facebookLoginCallback = (res: fb.StatusResponse) => {
    if (res.status === "connected") {
      const appScopedUserId = res.authResponse.userID;
      setAppScopedUserId(appScopedUserId);
      getInstagramAccountId({
        onSuccessCallback: setInstagramAccounts,
        logger,
      });
    }
  };
  return (
    <button
      onClick={() => {
        loginToFacebook(facebookLoginCallback, {
          scope: "instagram_basic,instagram_content_publish",
        });
      }}
      className="p-2 rounded-full flex items-center gap-2 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 text-white"
    >
      <Icons.instagram className="h-6 w-6 inline-block" />
      <p className="font-bold text-gray-100"> Connect Instagram Account</p>
    </button>
  );
}
