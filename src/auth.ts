import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./lib/password";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isRegister: { label: "isRegister", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = credentials.name as string;
        const isRegister = credentials.isRegister === "true";

        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        let user = existing[0];

        if (isRegister) {
          if (user) {
            throw new Error("Email já cadastrado.");
          }
          const passwordHash = hashPassword(password);
          const [newUser] = await db.insert(users).values({
            name: name || email.split("@")[0],
            email,
            passwordHash,
          }).returning();
          user = newUser;
        } else {
          if (!user) {
            throw new Error("E-mail não cadastrado.");
          }
          if (!user.passwordHash) {
            throw new Error("Esta conta foi criada via login social. Use Google ou GitHub.");
          }
          if (!verifyPassword(password, user.passwordHash)) {
            throw new Error("Senha incorreta.");
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
