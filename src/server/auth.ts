import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type ISODateString,
  // type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/env";
import { db } from "@/server/db";

interface DefaultSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    premium?: boolean | null;
  };
  expires: ISODateString;
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    async signIn({ user, account }) {
      console.log('SIGN IN CALLBACK');
      console.log('USER', user);
      console.log('ACCOUNT', account);
      if(!user.email) return false;
      if(!account) return false;

      const currentUser = await db.user.findUnique({
        where: {
          email: user.email,
        }
      });

      if(!currentUser) return true;

      const accounts = await db.account.findMany({
        where: {
          user: { id: currentUser.id }
        }
      });

      if (
        !accounts ||
        accounts.length === 0 ||
        !accounts.some((a) => a.provider === account.provider)
      ) {
        await db.account.create({
          data: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            access_token: account.access_token,
            expires_at: account.expires_at,
            user: { connect: { id: currentUser.id } },
            refresh_token: account.refresh_token,
            id_token: account.id_token,
            scope: account.scope,
            session_state: account.session_state,
            token_type: account.token_type,
          },
        });
      }

      return true;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "text", placeholder: "max.mustermann@mail.de" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: {
            email: credentials!.email
          }
        });

        if(user) {
          console.log('USER LOCATED');
          return user;
        }

        console.log("USER NOT FOUND");

        return null;
      }
    })
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
