import { getUser } from "@/app/actions/user";
import HeaderBarClientComponent from "@/components/common/HeaderBarClientComponent";

export default async function HeaderBar() {
  const { user, isProUser } = await getUser();
  return <HeaderBarClientComponent user={user} isProUser={isProUser} />;
}
