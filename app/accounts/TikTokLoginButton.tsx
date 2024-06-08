import { Button } from "@/components/common/Button";
import { loginWithTikTok } from "@/app/actions/tiktok";

export default function TikTokLoginButton() {
  return (
    <form action={loginWithTikTok}>
      <Button formAction={loginWithTikTok} type={"submit"}>
        Connect TikTok
      </Button>
    </form>
  );
}
