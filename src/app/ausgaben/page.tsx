import { getServerAuthSession } from "@/server/auth";
import { FinanceTable } from "../_components/finance-table";

export default async function Home() {
  const session = await getServerAuthSession();

  if(session?.user) return <FinanceTable />
}
