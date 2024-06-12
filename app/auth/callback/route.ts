import { endingFunctionString, startingFunctionString } from "@/utils/logging";
import { createClient } from "@/utils/supabase/server";
import { AxiomRequest, withAxiom } from "next-axiom";
import { NextResponse } from "next/server";

export const GET = withAxiom(async (request: AxiomRequest) => {
  const logger = request.log.with({
    route: "/auth/callback",
    method: "GET",
  });
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  logger.info(startingFunctionString, { code, origin });

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  logger.info(endingFunctionString);

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/accounts`);
});
