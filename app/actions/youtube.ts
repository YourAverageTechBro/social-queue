"use server";

import { serialize } from "cookie";
import youtubeAuthClient from "@/utils/youtube";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";

export const connectYoutubeAccount = async () => {
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
  ];

  const state = randomBytes(32).toString("hex");
  const authUrl = youtubeAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    state: state,
  });

  redirect(authUrl);
};
