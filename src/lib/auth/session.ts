import {getDb} from "@/db";
import { createId } from "../id";
import { SafeUser, Session, session, user } from "@/db/schema";
import { ResultHandler } from "../utils/result";
import {Result} from "@/types/result";
import {Errors} from "@/types/errors";
import { eq, and, gt, lt, getColumns } from "drizzle-orm";


const SESSION_DURATION = 7 * 24 * 60 * 60 *1000; //7 days
export const SESSION_COOKIE_NAME = "fika_session_cookie";

//Create new session
export async function createSession(userId: string):  Promise<Result<Session>> {
    try{
        const db = await getDb();
        const sessionId = createId();
        const expiresAt = new Date(Date.now() + SESSION_DURATION);

        const [created_Session] = await db.insert(session).values({ id: sessionId, userId, expiresAt, token: createId() }).returning();
        return ResultHandler.success(created_Session);
    } catch(error){
        console.error("Error creating session: ", error);
        return ResultHandler.failure("Failed to create session", Errors.INTERNAL_SERVER_ERROR);
    }
}
//Gets session & user data
export async function getSession(sessionId: string): Promise<Result<{session: Session; user: SafeUser} | null>> {
    try{
        const db = await getDb();
        const { passwordHash: _omit, ...safeColumns} = getColumns(user);
        const result = await db.select({session: session, user: safeColumns})
        .from(session).innerJoin(user, eq(session.userId, user.id)).where( 
            and(
                eq(session.id,sessionId),
                gt(session.expiresAt, new Date()),
                eq(user.isActive, true)
            )).limit(1);


        if(result.length === 0){
            return ResultHandler.success(null);
        }

        const {session: foundSession, user: foundUser} = result[0];

        //update last lojg time
        await db.update(user).set({lastLoginAt: new Date()}).where(eq(user.id, user.id));

        return ResultHandler.success({session: foundSession, user: foundUser});
    }catch(error){
        console.error("Error getting session:", error); 
        return ResultHandler.failure(
            "Failed to get session", Errors.INTERNAL_SERVER_ERROR
        );
    }
}

//Delete a session (logout)
export async function deleteSession(sessionId: string): Promise<Result<void>>{
    try{
        const db = await getDb();
        await db.delete(session).where(eq(session.id, sessionId));
        return ResultHandler.success(undefined);
    }catch(error){
        console.error("Error edeletion sesison:", error);
        return ResultHandler.failure("Failed to delete session", Errors.INTERNAL_SERVER_ERROR);
    }
}
//Cleanup expired sesisons
export async function cleanupExpieredSessions(): Promise<Result<number>> {
    try{
        const db = await getDb();

        const deleate = await db.delete(session).where(lt(session.expiresAt, new Date())).returning({id: session.id});
        return ResultHandler.success(deleate.length);
    }catch(error){
        console.error("Error cleaning up session:", error);
        return ResultHandler.failure("Failed to cleanup session", Errors.INTERNAL_SERVER_ERROR);
    }
    
}

//session cookie configuration
export function getSessionCookieOptions(){
    return{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION / 1000,
        path: "/",
    }
}

//Helper function to extract session id from cookies
export function extractSessionFromCookies(cookieHeader: string): string | null {
    const cookies = cookieHeader.split(";").map((c) => c.trim());

    for(const cookie of cookies){
        const[name, value] = cookie.split("=");
        if(name === SESSION_COOKIE_NAME){
            return decodeURIComponent(value);
        }
    }
    return null;
}
//HElper function to exctact session ID from cookies

export function setSessionCookie(sessionId: string): string{
    const options = getSessionCookieOptions();

    const baseCookie = [
        `${SESSION_COOKIE_NAME} = ${encodeURIComponent(sessionId)}`,
        `Max-Age=${options.maxAge}`, `Path=${options.path}`, `SameSite=${options.sameSite}` 
    ];

    if (options.httpOnly) baseCookie.push("HttpOnly");
    if(options.secure)baseCookie.push("Secure");
    return baseCookie.join("; ");
}
//Helper func tion to set session cookie

//Helper function to clear session cookie
export function clearSessionCookie(): string{
    const options = getSessionCookieOptions();

    const baseCookie = [
        `${SESSION_COOKIE_NAME}=; Mag-Age=0`, `Path=${options.path}`, `SameSite=${options.sameSite}`,
    ];

    if (options.httpOnly) baseCookie.push("HttpOnly");
    if (options.secure) baseCookie.push("Secure");

    return baseCookie.join("; ");
}