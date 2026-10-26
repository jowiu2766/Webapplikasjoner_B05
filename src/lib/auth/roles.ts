import type { SafeUser } from "@/db/schema";
import type { UserRole } from "@/lib/enums";

export const isUser = (user: SafeUser | null): boolean => user !== null;

export const getRole = (user: SafeUser | null | undefined): UserRole | null => user?.role ?? null;

export const hasRole = (user: SafeUser | null | undefined, role: UserRole): boolean =>
  getRole(user) === role;
