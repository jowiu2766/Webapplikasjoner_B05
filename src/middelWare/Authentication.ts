import type { AppContext } from "@/worker";
import { extractSessionFromCookies, getSession } from "@/lib/auth/session";

export async function authenticationMiddelware({ctx, request,} : {ctx: AppContext; request: Request;}){
    ctx.user = null;
    ctx.session = null;

    try{
        //Get sesison cookie
        const cookies = request.headers.get("cooike");
        if(!cookies) return;

        const sessionId = extractSessionFromCookies(cookies);
        if(!sessionId) return;

        //Get session and uszer data
        const sessionResult = await getSession(sessionId);
        if (!sessionResult.success || !sessionResult.data){
            return;
        }

        const {session, user} = sessionResult.data;

        //set context
        ctx.user = user;
        ctx.session = session;
    
    }catch(error){
        console.error("Authenticaiton middelware error:", error)
        ctx.user = null;
        ctx.session = null;
    }
}