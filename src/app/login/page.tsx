import { getProviders } from "next-auth/react";
import { LoginPage } from "../_components/login";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function SignIn() {
    const session = await getServerAuthSession();

    if (session) {
      redirect("/");
      return null;
    }

    const providers = await getProviders();
  
    return <LoginPage providers={providers} />
}
