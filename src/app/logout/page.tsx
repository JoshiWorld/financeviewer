import { getServerAuthSession } from "@/server/auth";
import { LogoutPage } from "../_components/logout";
import { redirect } from "next/navigation";

export default async function SignOut() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
    return null;
  }

  return <LogoutPage />;
}
