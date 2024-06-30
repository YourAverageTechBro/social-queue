import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";
import { kv } from "@vercel/kv";
import { AxiomRequest, Logger, withAxiom } from "next-axiom";
import { NextResponse } from "next/server";

export const GET = withAxiom(async (req: AxiomRequest) => {
  const logger = req.log.with({
    path: "/api/cron/github-star-count",
    method: "GET",
  });
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  try {
    logger.info(startingFunctionString);
    await refreshGithubStarCount(logger);
    logger.info(endingFunctionString);
    return NextResponse.json(
      { message: "Successfully refreshed github star count" },
      { status: 200 }
    );
  } catch (error) {
    logger.error(errorString);
    return NextResponse.json(
      { message: "Error refreshing github star count" },
      { status: 500 }
    );
  }
});

const refreshGithubStarCount = async (logger: Logger) => {
  const response = await fetch(
    "https://api.github.com/repos/YourAverageTechBro/social-queue",
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub star count");
  }

  const data = await response.json();
  const starCount = data.stargazers_count;

  logger.info("Fetched GitHub star count", { starCount });
  await kv.set("github-star-count", starCount);
};
