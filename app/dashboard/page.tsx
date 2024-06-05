import { getUser } from "@/app/actions/user";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { user } = await getUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <div>
      <p> hi this is dashboard </p>
    </div>
  );
}
