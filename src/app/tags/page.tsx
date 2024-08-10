import { getServerAuthSession } from "@/server/auth";
import { EditTags } from "../_components/tags-edit";
import { api } from "@/trpc/server";

export default async function Tags() {
  const session = await getServerAuthSession();

  if(!session) return <p>Du musst eingeloggt sein.</p>;

  const user = await api.user.get();

  if (!session.user || !user) return <p>Dein Benutzer konnte nicht geladen werden</p>;
  if(!user.premium) <p>Diese Seite kannst du nur mit einem Premium-Abo nutzen.</p>

  return <EditTags />;
}
