"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as crypto from "node:crypto";

export const loginWithTikTok = async () => {
  // const csrfState = Math.random().toString(36).substring(2);

  const codeVerifier = generateRandomString(128);
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("hex");

  let url = "https://www.tiktok.com/v2/auth/authorize/";

  // the following params need to be in `application/x-www-form-urlencoded` format.
  url += `?client_key=${process.env.TIKTOK_CLIENT_KEY}`;
  url += "&scope=user.info.basic";
  url += "&response_type=code";
  url += `&redirect_uri=${headers().get("origin")}/accounts`;
  url += `&code_challenge=${codeChallenge}`;
  url += "&code_challenge_method=S256";
  redirect(url);
};

const generateRandomString = (length: number) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
