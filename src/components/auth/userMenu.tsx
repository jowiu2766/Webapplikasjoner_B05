"use client";

import {useAuth} from "@/context/AuthProvider";

export function UserMenu(){
    const { user, isAuthenticated, logout } = useAuth();

    if(!isAuthenticated){
        return(
            <div className="flex items-center gap-3">
                <a href="/auth/login" className="hover:underline">Login</a>
                <a href="/auth/register" className="hover:underline">Register</a>
            </div>
        );
    }
return(
    <div className="flex items-center gap-3">
        <span>{user?.name}</span>
        <button type="button" onClick={() => logout()} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">Logout</button>
    </div>
)

}