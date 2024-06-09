import { Button } from "@/components/common/Button";
import { connectYoutubeAccount } from "../actions/youtube";

export default function YoutubeLoginButton() {
  return (
    <form action={connectYoutubeAccount}>
      <Button type="submit">Youtube Login</Button>
    </form>
  );
}
