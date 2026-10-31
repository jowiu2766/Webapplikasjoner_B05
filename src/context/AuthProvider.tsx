"use client";

import { createContext,useContext, useState, useCallback, type ReactNode } from "react";
import type { SafeUser } from "@/db/schema";
import { logout as logutAction } from "@/api/auth/authServerActions";

export interface AuthContextType{
    user: SafeUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (user: SafeUser) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps{
    children: ReactNode;
    initialUser: SafeUser | null;
}

export function AuthProvider({children, initialUser = null}: AuthProviderProps){
    const [user, setUser] = useState<SafeUser | null>(initialUser);

    //Login Handler oppdater use state
    const login = useCallback((newUser: SafeUser) => {setUser(newUser);},[]);

    //logout handler
    const logout = useCallback(async () => {
        await logutAction();
        setUser(null);
        if(typeof window !== "undefined") window.location.href ="/auth/login";
    }, [])

    const value: AuthContextType = {user, isAuthenticated: !!user, isAdmin: user?.role ==="Admin", login, logout}

    return <AuthContext value={value}>{children}</AuthContext>
}

//hook for klient componens
export function useAuth(): AuthContextType{
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("use auth må brukes i <AuthProvider>");
    return ctx;
}