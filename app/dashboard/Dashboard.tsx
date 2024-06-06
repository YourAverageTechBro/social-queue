"use client";

import ConnectFacebookAccountButton from "@/app/dashboard/ConnectFacebookAccountButton";
import { useEffect, useState } from "react";
import { InstagramAccount } from "@/utils/facebookSdk";
import { saveInstagramAccount } from "@/app/actions/instagramAccounts";
import { useFormState } from "react-dom";
import { Button } from "@/components/common/Button";
import toast from "react-hot-toast";

export default function Dashboard({ userId }: { userId: string }) {
  const [appScopedUserId, setAppScopedUserId] = useState<string>("");
  const [instagramAccounts, setInstagramAccounts] = useState<
    InstagramAccount[]
  >([]);
  const [state, formAction] = useFormState(saveInstagramAccount, {
    error: null,
    data: "",
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.data) {
      toast.success(state.data);
    }
  }, [state]);

  return (
    <div>
      <ConnectFacebookAccountButton
        setAppScopedUserId={setAppScopedUserId}
        setInstagramAccounts={setInstagramAccounts}
      />
      {instagramAccounts.map((account) => (
        <form
          action={formAction}
          className={"border-2 border-white p-4 rounded-lg"}
          key={account.id}
        >
          <input
            type={"hidden"}
            name={"appScopedUserId"}
            value={appScopedUserId}
          />
          <input
            type={"hidden"}
            name={"shortLivedAccessToken"}
            value={account.access_token}
          />
          <input
            type={"hidden"}
            name={"instagramBusinessAccountId"}
            value={account.instagram_business_account.id}
          />
          <input type={"hidden"} name={"facebookPageId"} value={account.id} />
          <input
            type={"hidden"}
            name={"instagramAccountName"}
            value={account.name}
          />
          <input
            type={"hidden"}
            name={"pictureUrl"}
            value={account.picture.data.url}
          />
          <input type={"hidden"} name={"userId"} value={userId} />
          <p>{account.name} </p>
          <Button type={"submit"}>Save Account</Button>
        </form>
      ))}
    </div>
  );
}
