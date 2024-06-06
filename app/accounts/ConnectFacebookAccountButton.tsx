import { Button } from "@/components/common/Button";
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
    <Button
      onClick={() => {
        loginToFacebook(facebookLoginCallback, {
          scope:
            "instagram_basic,instagram_content_publish,pages_read_engagement",
        });
      }}
    >
      Connect Facebook
    </Button>
  );
}
