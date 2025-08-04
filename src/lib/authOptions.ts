import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];
      if (allowedEmails.includes(user.email || "")) {
        return true;
      }
      return false; // Bloque l'accès si l'email n'est pas autorisé
    },
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
