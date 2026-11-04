import type { LayoutProps } from "rwsdk/worker";
import { AuthProvider } from "@/context/AuthProvider";
import { UserMenu } from "@/components/auth/userMenu";

export function AppLayout({children, requestInfo}: LayoutProps){
    const initialUser = requestInfo?.ctx.user ?? null;

    return(
        <AuthProvider initialUser={initialUser}>
             <div className="Fiksa">
                <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-3">
                    <nav className="flex items-center gap-4">
                        <a href="/">Home</a>
                        {initialUser && <a href="/saker">saker</a>}
                    </nav>
                    <UserMenu/>
                </header>
                <main>{children}</main>
                <footer>&copy; {new Date().getFullYear()}</footer>
            </div>

        </AuthProvider>
       
    );
}