"use client";

import ConnectFacebookAccountButton from "@/app/dashboard/ConnectFacebookAccountButton";
import { useState } from "react";
import { InstagramAccount } from "@/utils/facebookSdk";

export default function Dashboard() {
  const [appScopedUserId, setAppScopedUserId] = useState<string>("");
  const [instagramAccounts, setInstagramAccounts] = useState<
    InstagramAccount[]
  >([]);
  return (
    <div>
      <ConnectFacebookAccountButton
        setAppScopedUserId={setAppScopedUserId}
        setInstagramAccounts={setInstagramAccounts}
      />
      {instagramAccounts.map((account) => (
        <div className={"border-2 "} key={account.id}>
          {account.name}
        </div>
      ))}
    </div>
  );
}
