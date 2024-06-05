"use client";

import { useEffect } from "react";
import { initFacebookSdk } from "@/utils/facebookSdk";

export function FacebookProvider() {
  useEffect(() => {
    void initFacebookSdk();
  });

  return <></>;
}
