import type { SafeUser, User, UserRole } from "@/db/schema";
import { boolean } from "zod";

export const isAdmin = (user: SafeUser | null): boolean => {
    return user?.role === "Admin";
}

export const isUser = (user: SafeUser | null): boolean =>{
    return user !== null;
}

export const getRole = (user: SafeUser | null | undefined): UserRole => user?.role ?? "Unauthenticated";

export const hasRole = (user: SafeUser |null | undefined, role: UserRole): boolean => getRole(user) === role;