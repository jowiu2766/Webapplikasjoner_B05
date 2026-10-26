"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";
import type { SafeUser } from "@/db/schema";

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
    const logout = useCallback(() => {
        setUser(null);
        if(typeof window !== "undefined") window.location.href ="/auth/login";
    }, [])

    const value: AuthContextType = {user, isAuthenticated: !!user, isAdmin: user?.role ==="Admin", login, logout}

    return <AuthContext value={value}>{children}</AuthContext>
}