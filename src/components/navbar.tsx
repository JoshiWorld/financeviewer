"use client";

import Link from "next/link";
import { ToggleTheme } from "./ui/toggle-theme";
import { type Session } from "next-auth";

export function Navbar() {
    return (
      <div className="flex items-center justify-center border-b-2 bg-background">
        <div className="m-2 flex-none px-4 py-2 text-center">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Finance<span className="text-primary">Viewer</span>
          </h3>
        </div>
        <div className="m-2 flex-grow px-4 py-2 text-center">
          <Link href="test" className="border-b-2 border-primary font-semibold">
            Finanzen
          </Link>
        </div>
        <div className="m-2 flex flex-none items-center justify-between px-4 py-2 text-center">
          <Link
            href="api/auth/signin"
            className="mr-4 font-semibold"
          >
            Login
          </Link>
          <ToggleTheme />
        </div>
      </div>
    );
}

export function NavbarLoggedIn({ session }: { session: Session }) {
  return (
    <div className="flex items-center justify-center border-b-2 bg-background">
      <div className="m-2 flex-none px-4 py-2 text-center">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Finance<span className="text-primary">Viewer</span>
        </h3>
      </div>
      <div className="m-2 flex-grow px-4 py-2 text-center">
        <Link href="test" className="border-b-2 border-primary font-semibold">
          Finanzen
        </Link>
      </div>
      <div className="m-2 flex flex-none items-center justify-between px-4 py-2 text-center">
        <Link href="user" className="mr-4 font-semibold">
          {session.user.name}
        </Link>
        <ToggleTheme />
      </div>
    </div>
  );
}