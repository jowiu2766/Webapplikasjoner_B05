import {getDb} from "@/db";
import { createId } from "../utils/id";
import { SafeUser, Session, sessions, users } from "@/db/schema";
import { ResultHandler } from "../utils/result";
import {Result} from "@/types/result";
import {Errors} from "@/types/errors";
import { eq, and, gt, lt } from "drizzle-orm";


const SESSION_DURATION = 7 * 24 * 60 * 60 *1000; //7 days
export const SESSION_COOKIE_NAME = "fika_session_cookie";

//Create new session
export async function createSession(userId: number):  Promise<Result<Session>> {
    try{
        const db = await getDb();
        const sessionId = createId();
        const expiresAt = new Date(Date.now() + SESSION_DURATION);

        const [session] = await db.insert(sessions).values({id: sessionId, userId, expiresAt}).returning();
        return ResultHandler.sucsess(session);
    } catch(error){
        console.error("Error creating session: ", error);
        return ResultHandler.failure("Failed to create session", Errors.INTERNAL_SERVER_ERROR);
    }
}
//Gets session & user data
export async function getSession(sessionId: string): Promise<Result<{session: Session; user: SafeUser} | null>> {
    try{
        const db = await getDb();
        const result = await db.select({
            session: sessions, 
            user:{
                id: users.id,
                username: users.username,
                email: users.email,
                role: users.role,
                isActive: users.isActive,
                lastLoginAt: users.lastLoginAt,
                createdAt:users.createdAt,
                updatedAt: users.updatedAt,
            },
        }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(
            and(
                eq(sessions.id,sessionId),
                gt(sessions.expiresAt, new Date()),
                eq(users.isActive, true)
            )
        ).limit(1);
        if(result.length === 0){
            return ResultHandler.sucsess(null);
        }

        const {session, user} = result[0];

        //update last lojg time
        await db.update(users).set({lastLoginAt: new Date()}).where(eq(users.id, user.id));

        return ResultHandler.sucsess({session, user});
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
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        return ResultHandler.sucsess(undefined);
    }catch(error){
        console.error("Error edeletion sesison:", error);
        return ResultHandler.failure("Failed to delete session", Errors.INTERNAL_SERVER_ERROR);
    }
}
//Cleanup expired sesisons
export async function cleanupExpieredSessions(): Promise<Result<number>> {
    try{
        const db = await getDb();

        const deleate = await db.delete(sessions).where(lt(sessions.expiresAt, new Date())).returning({id: sessions.id});
        return ResultHandler.sucsess(deleate.length);
    }catch(error){
        console.error("Error cleaning up sessions:", error);
        return ResultHandler.failure("Failed to cleanup sessions", Errors.INTERNAL_SERVER_ERROR);
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
