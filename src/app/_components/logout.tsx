"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function LogoutPage() {
  return <Button onClick={() => signOut({ callbackUrl: '/' })}>Ausloggen</Button>;
}
