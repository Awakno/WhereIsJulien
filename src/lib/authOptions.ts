import GithubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.email = token.email as string | undefined;
      }
      return session;
    },
    async jwt({ token, profile }: { token: JWT; profile?: any }) {
      if (profile) {
        token.email = profile.email;
      }
      return token;
    },
  },
};
