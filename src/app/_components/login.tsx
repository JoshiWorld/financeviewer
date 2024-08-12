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
import { type ClientSafeProvider, type LiteralUnion, signIn } from "next-auth/react";

export function LoginPage({
  providers,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
}) {
  return (
    <>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>
            Hier kannst du dich anmelden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              {/* @ts-expect-error || @ts-ignore */}
              {Object.values(providers).map((provider) => (
                <div key={provider.name} className="flex flex-col space-y-1.5">
                  <Button type="button" onClick={() => signIn(provider.id)}>{provider.name}</Button>
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
