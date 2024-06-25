import { refreshTikTokAccessTokens } from "@/app/actions/tiktok";
import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";
import { AxiomRequest, withAxiom } from "next-axiom";
import { NextResponse } from "next/server";

export const GET = withAxiom(async (req: AxiomRequest) => {
  const logger = req.log.with({
    path: "/api/cron/refresh-tiktok-token",
    method: "GET",
  });
  // const authHeader = req.headers.get("authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response("Unauthorized", {
  //     status: 401,
  //   });
  // }
  try {
    logger.info(startingFunctionString);
    await refreshTikTokAccessTokens();
    logger.info(endingFunctionString);
    return NextResponse.json(
      { message: "Successfully refreshed tiktok access tokens" },
      { status: 200 }
    );
  } catch (error) {
    logger.error(errorString);
    return NextResponse.json(
      { message: "Error refreshing tiktok access tokens" },
      { status: 500 }
    );
  }
});
