import { getUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import Text from "@/components/common/Text";
import LoginClientComponent from "@/app/login/LoginClientComponent";

export default async function Login() {
  const { user } = await getUser();
  if (user) {
    redirect("/accounts");
  }
  return (
    <div className="flex-1 flex flex-col px-8 h-full items-center justify-center gap-2 mt-24">
      <Text
        intent={"title"}
        text={"Welcome To The Content Marketing Blueprint"}
      />
      <LoginClientComponent />
    </div>
  );
}
