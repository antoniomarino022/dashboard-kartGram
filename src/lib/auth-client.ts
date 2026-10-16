import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://kart-gram.vercel.app",
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

export interface SessionUserWithRole {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}
