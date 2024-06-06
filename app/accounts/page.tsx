import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/user";
import Dashboard from "@/app/accounts/Dashboard";

export default async function Page() {
  const { user } = await getUser();
  if (!user) {
    redirect("/login");
  }

  return <Dashboard userId={user.id} />;
}
