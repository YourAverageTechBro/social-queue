"use client";

import { Auth } from "@supabase/auth-ui-react";
import { createClient } from "@/utils/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginClientComponent() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  });

  return (
    <Auth
      supabaseClient={supabase}
      providers={["google"]}
      redirectTo={`${location.origin}/auth/callback`}
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
