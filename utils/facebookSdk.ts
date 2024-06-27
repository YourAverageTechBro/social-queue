import { Logger } from "next-axiom";
import { errorString } from "@/utils/logging";
import toast from "react-hot-toast";
import { saveInstagramAccount } from "@/app/actions/instagramAccounts";

const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;

export async function initFacebookSdk() {
  await createScriptEle();
  window.fbAsyncInit = () => {
    window.FB.init({
      appId: facebookAppId,
      cookie: true,
      xfbml: true,
      version: "v20.0",
    });

    FB.AppEvents.logPageView();
    // auto authenticate with the api if already logged in with facebook
    window.FB.getLoginStatus(() => {});
  };

  void createScriptEle();
}

const createScriptEle = async () => {
  return new Promise((resolve) => {
    const scriptId = "facebook-jssdk";
    const element = document.getElementsByTagName("script")[0];
    const fjs = element as Element;

    // return if script already exists
    if (document.getElementById(scriptId)) {
      return;
    }

    const js: HTMLScriptElement = document.createElement("script");
    js.id = scriptId;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    js.onload = resolve;

    fjs.parentNode!.insertBefore(js, fjs);
  });
};

export const loginToFacebook = (
  callback: (res: fb.StatusResponse) => void,
  loginOptions: fb.LoginOptions
) => {
  window.FB.login(callback, loginOptions);
};

export const saveInstagramAccounts = ({
  logger,
  appScopedUserId,
}: {
  logger: Logger;
  appScopedUserId: string;
}) => {
  FB.api(
    "/me/accounts",
    "get",
    { fields: "picture{url},name,access_token,instagram_business_account" },
    (response: { error: FacebookGraphError; data: InstagramAccount[] }) => {
      if (response.error) {
        logger.error(errorString, response.error);
        toast.error(
          "Sorry, we had an issue connecting to Facebook. Please try again."
        );
      } else {
        response.data.forEach((account) => {
          saveInstagramAccount({
            appScopedUserId,
            shortLivedAccessToken: account.access_token,
            instagramBusinessAccountId: account.instagram_business_account.id,
            facebookPageId: account.id,
            instagramAccountName: account.name,
            pictureUrl: account.picture.data.url,
            userId: appScopedUserId,
          });
        });
      }
    }
  );
};

export type InstagramAccount = {
  access_token: string;
  id: string;
  instagram_business_account: { id: string };
  name: string;
  picture: { data: { url: string } };
};

export type FacebookGraphError = {
  message: string;
  type: string;
  code: number;
  error_subcode: number;
  error_user_title: string;
  error_user_msg: string;
  fbtrace_id: string;
};

const GRAPH_API_BASE_URL = `https://graph.facebook.com/v${process.env.FACEBOOK_GRAPH_API_VERSION}`;

export const buildGraphAPIURL = ({
  path,
  searchParams,
  accessToken,
}: {
  path: string;
  searchParams: Record<string, string | null | undefined>;
  accessToken?: string;
}): string => {
  const url = new URL(path, GRAPH_API_BASE_URL);

  Object.keys(searchParams).forEach((key) => {
    if (!searchParams[key]) {
      delete searchParams[key];
    }
  });

  url.search = new URLSearchParams(
    searchParams as Record<string, string>
  ).toString();

  if (accessToken) {
    url.searchParams.append("access_token", accessToken);
  }

  return url.toString();
};
