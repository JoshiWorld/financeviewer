import { getServerAuthSession } from "@/server/auth"
import { SettingsForm } from "../_components/settings-form";

export default async function Settings() {
    const session = await getServerAuthSession();

    if(session?.user) return <SettingsForm userId={session.user.id} />
}