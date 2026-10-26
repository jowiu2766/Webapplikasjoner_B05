import type { SafeUser, Session } from "@/db/schema";
import type { UserRole } from "@/lib/enums";

export interface AuthContext {
  user: SafeUser | null;
  session: Session | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}
