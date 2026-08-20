import NextAuth, { type User, type DefaultSession } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./database/drizzle";
import { users } from "./database/schema";
import { eq } from "drizzle-orm";
 
// Extend Auth.js core interfaces to avoid TypeScript session compilation bugs
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const userResults = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email.toString()))
            .limit(1);

          if (userResults.length === 0) return null;
          const dbUser = userResults[0];

          // Verify password using bcryptjs securely
          const isPasswordValid = await compare(
            credentials.password.toString(),
            dbUser.password
          );
          
          if (!isPasswordValid) return null;

          // Map database columns to the expected Auth.js User shape cleanly
          return {
            id: dbUser.id.toString(),
            email: dbUser.email,
            name: dbUser.fullName || "", 
          };
        } catch (error) {
          console.error("Critical database authorize intercept:", error);
          return null;
        }
      },
    })
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string; 
      }
      return session;
    }
  }
});
