import type { LayoutProps } from "rwsdk/worker";

export function AppLayout({children, requestInfo}: LayoutProps){
    return(
        <div className="Fiksa">
            <header>
                <nav>
                    <a href="/">Home</a>
                    <a href="/about">About</a>
                    <a href="/TestScreen">TestScreen</a>
                </nav>
                {requestInfo && (<span>Path: {new URL(requestInfo.request.url).pathname}</span>)}
            </header>
            <main>{children}</main>
            <footer>&copy; {new Date().getFullYear()}</footer>
        </div>
    );
}