"use client";

import { Auth } from "@supabase/auth-ui-react";
import { createClient } from "@/utils/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Text from "@/components/common/Text";
import TextInput from "@/components/common/TextInput";
import { Button } from "@/components/common/Button";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { signInWithMagicLink } from "../actions/user";

export default function LoginClientComponent() {
  const supabase = createClient();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [state, formAction] = useFormState(signInWithMagicLink, {
    data: "",
    error: null,
  });

  useEffect(() => {
    if (state.error) {
      setError(state.error);
    }
    if (state.data) {
      setMessage(state.data);
    }
  }, [state.error, state.data]);

  return (
    <div className="flex-1 flex flex-col px-8 h-full items-center gap-2 mt-12">
      <Text intent={"title"} text={"Welcome To Social Queue"} />
      <Auth
        supabaseClient={supabase}
        providers={["google"]}
        redirectTo={`${location.origin}/auth/callback`}
        onlyThirdPartyProviders
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#DD6B20",
                brandAccent: "#DD6B20",
              },
            },
          },
        }}
        theme={"dark"}
      />
      <div className="w-full border-t border-gray-300 my-4"></div>
      <form
        action={formAction}
        className="flex flex-col justify-center items-center"
      >
        <TextInput name="email" type="email" placeholder="Enter your email" />
        <Button type="submit">Send Sign In Link</Button>
      </form>
      {error && <Text color="error" text={error} />}
      {message && <Text text={message} />}
    </div>
  );
}
