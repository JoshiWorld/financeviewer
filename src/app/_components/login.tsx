"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type BuiltInProviderType } from "next-auth/providers/index";
import {
  type ClientSafeProvider,
  type LiteralUnion,
  signIn,
} from "next-auth/react";
import { SelectSeparator } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function LoginPage({
  providers,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleCredentials = async () => {
    await signIn("credentials", { email, password });
  }

  return (
    <>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>Hier kannst du dich anmelden</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectSeparator />

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-Mail
              </Label>
              <Input
                id="email"
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                value={email}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Passwort
              </Label>
              <Input
                id="password"
                type="password"
                onChange={(event) => setPassword(event.target.value)}
                value={password}
                className="col-span-3"
              />
            </div>
            <div className="flex justify-center">
              <Button type="button" onClick={handleCredentials}>Anmelden</Button>
            </div>
          </div>

          <SelectSeparator className="mb-4" />
          <form>
            <div className="grid w-full items-center gap-4">
              {/* @ts-expect-error || @ts-ignore */}
              {Object.values(providers).map((provider) => (
                <div key={provider.name} className="flex flex-col space-y-1.5">
                  {provider.id !== "credentials" && (
                    <Button
                      type="button"
                      className={
                        provider.id === "discord"
                          ? "bg-blue-700 text-white hover:bg-blue-700/80"
                          : provider.id === "google"
                            ? "bg-white hover:bg-white/80"
                            : ""
                      }
                      onClick={() => signIn(provider.id)}
                    >
                      {provider.name}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </form>
        </CardContent>
        {/* <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter> */}
      </Card>
    </>
  );
}
