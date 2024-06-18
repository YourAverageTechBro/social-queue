"use server";

import { createClient } from "@/utils/supabase/server";
import { Logger } from "next-axiom";
import {
  endingFunctionString,
  errorString,
  startingFunctionString,
} from "@/utils/logging";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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

export const signInWithMagicLink = async (prevState: any, data: FormData) => {
  const supabase = createClient();
  const email = data.get("email") as string;
  const logger = new Logger().with({ function: "signInWithMagicLink", email });
  logger.info(startingFunctionString);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${headers().get("origin")}/auth/otp/callback`,
    },
  });
  if (error) {
    logger.error(errorString, error);
    await logger.flush();
    return { error: error.message };
  }
  logger.info(endingFunctionString);
  revalidatePath("/", "layout");
  return {
    data: "Sign in email sent",
    error: null,
  };
};
