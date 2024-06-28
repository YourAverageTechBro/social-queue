import { Button } from "@/components/common/Button";
import { loginWithTikTok } from "@/app/actions/tiktok";
import Icons from "@/components/common/Icons";

export default function TikTokLoginButton() {
  return (
    <form action={loginWithTikTok}>
      <button
        className="p-2 rounded-full flex items-center gap-2 bg-white text-black"
        formAction={loginWithTikTok}
        type={"submit"}
      >
        <Icons.tiktok className="inline-block h-6 w-6" />
        <p className="font-bold">Connect TikTok Account</p>
      </button>
    </form>
  );
}
