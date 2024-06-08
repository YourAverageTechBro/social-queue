"use server";

import { createClient } from "@/utils/supabase/server";
import { Logger } from "next-axiom";
import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";
import { redirect } from "next/navigation";

export const getUser = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user };
};

export const signOut = async (_: FormData) => {
  const supabase = createClient();
  const logger = new Logger().with({ function: "signOut" });
  logger.info(startingFunctionString);
  const { error } = await supabase.auth.signOut();
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    return redirect("/login?message=Could not authenticate user");
  }
  logger.info(endingFunctionString);
  return redirect("/");
};
