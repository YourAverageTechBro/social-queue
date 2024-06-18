import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { AxiomRequest, withAxiom } from "next-axiom";
import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";

export const GET = withAxiom(async (request: AxiomRequest) => {
  let logger = request.log.with({
    route: "/auth/otp/callback",
    method: "GET",
  });
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  logger = logger.with({
    token_hash,
    type,
    next,
  });

  logger.info(startingFunctionString);

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirectTo.searchParams.delete("next");
      logger.info(endingFunctionString);
      return NextResponse.redirect(redirectTo);
    }
  }
  logger.error(errorString);

  // return the user to an error page with some instructions
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
});
