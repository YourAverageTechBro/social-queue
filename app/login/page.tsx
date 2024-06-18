import { getUser } from "@/app/actions/user";
import { redirect } from "next/navigation";
import LoginClientComponent from "@/app/login/LoginClientComponent";

export default async function Login() {
  const { user } = await getUser();
  if (user) {
    redirect("/accounts");
  }
  return <LoginClientComponent />;
}
