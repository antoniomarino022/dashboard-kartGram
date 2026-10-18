import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/lib/api-url";

export const authClient = createAuthClient({
  baseURL: API_URL,
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
