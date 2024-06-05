"use client";

import { Auth } from "@supabase/auth-ui-react";
import { createClient } from "@/utils/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function LoginClientComponent() {
  const supabase = createClient();
  return (
    <Auth
      redirectTo={`${location.origin}/auth/callback`}
      supabaseClient={supabase}
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
  );
}
