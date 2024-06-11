import { Button } from "@/components/common/Button";
import { connectYoutubeAccount } from "../actions/youtube";
import Icons from "@/components/common/Icons";

export default function ConnectYoutubeAccountButton() {
  return (
    <form action={connectYoutubeAccount}>
      <button className="p-2 rounded-full flex items-center gap-2 bg-red-600 text-white">
        <Icons.youtube className="inline-block h-6 w-6" />
        <p className="font-bold text-gray-100">Connect YouTube Account</p>
      </button>
    </form>
  );
}
