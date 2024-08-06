import { getServerAuthSession } from "@/server/auth";
import { EinnahmenInput } from "../_components/einnahmen-input";

export default async function Einnahmen() {
  const session = await getServerAuthSession();

  if (session?.user) return <EinnahmenInput userId={session.user.id} />;
}
