import "@/styles/globals.css";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";

import { cn } from "@/lib/utils";
import { api, HydrateClient } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import { Navbar, NavbarLoggedIn } from "@/components/navbar";

export const metadata: Metadata = {
  title: "FinanceViewer",
  description: "By Joshua Stieber",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();

  if (session?.user) void api.finance.getAll.prefetch();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <HydrateClient>
              {session?.user ? (
                <NavbarLoggedIn session={session} />
              ) : (
                <Navbar />
              )}
              <main className="flex min-h-screen flex-col items-center bg-background">
                <div className="container flex flex-col items-center justify-center gap-12 px-20 py-16">
                  {children}
                </div>
              </main>
            </HydrateClient>
            <Toaster />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
