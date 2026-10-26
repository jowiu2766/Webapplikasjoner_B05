import { db } from "@/db";
import { createId } from "../id";
import { session, user } from "@/db/schema";
import type { SafeUser, Session } from "@/db/schema";
import { ResultHandler } from "../utils/result";
import type { Result } from "@/types/result";
import { Errors } from "@/types/errors";
import { eq, and, gt, lt } from "drizzle-orm";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dager
export const SESSION_COOKIE_NAME = "fiksa_session";

export async function createSession(userId: string): Promise<Result<Session>> {
  try {
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    const [created] = await db
      .insert(session)
      .values({ id: createId(), token: createId(), userId, expiresAt })
      .returning();
    return ResultHandler.success(created);
  } catch (error) {
    console.error("Error creating session: ", error);
    return ResultHandler.failure("Failed to create session", Errors.INTERNAL_SERVER_ERROR);
  }
}

export async function getSession(
  sessionId: string
): Promise<Result<{ session: Session; user: SafeUser } | null>> {
  try {
    const result = await db
      .select({
        session,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role,
          image: user.image,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          address: user.address,
        },
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(
        and(
          eq(session.id, sessionId),
          gt(session.expiresAt, new Date()),
          eq(user.isActive, true)
        )
      )
      .limit(1);
    if (result.length === 0) {
      return ResultHandler.success(null);
    }

    const funnet = result[0];
    await db.update(user).set({ lastLoginAt: new Date() }).where(eq(user.id, funnet.user.id));

    return ResultHandler.success({ session: funnet.session, user: funnet.user });
  } catch (error) {
    console.error("Error getting session:", error);
    return ResultHandler.failure("Failed to get session", Errors.INTERNAL_SERVER_ERROR);
  }
}

export async function deleteSession(sessionId: string): Promise<Result<void>> {
  try {
    await db.delete(session).where(eq(session.id, sessionId));
    return ResultHandler.success(undefined);
  } catch (error) {
    console.error("Error deleting session:", error);
    return ResultHandler.failure("Failed to delete session", Errors.INTERNAL_SERVER_ERROR);
  }
}

export async function cleanupExpiredSessions(): Promise<Result<number>> {
  try {
    const slettet = await db
      .delete(session)
      .where(lt(session.expiresAt, new Date()))
      .returning({ id: session.id });
    return ResultHandler.success(slettet.length);
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    return ResultHandler.failure("Failed to cleanup sessions", Errors.INTERNAL_SERVER_ERROR);
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    // Koden kjører i workerd, ikke Node, så process.env finnes ikke.
    secure: !import.meta.env.VITE_IS_DEV_SERVER,
    sameSite: "Lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  };
}

export function extractSessionFromCookies(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === SESSION_COOKIE_NAME && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function setSessionCookie(sessionId: string): string {
  const options = getSessionCookieOptions();
  const deler = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    `Max-Age=${options.maxAge}`,
    `Path=${options.path}`,
    `SameSite=${options.sameSite}`,
  ];
  if (options.httpOnly) deler.push("HttpOnly");
  if (options.secure) deler.push("Secure");
  return deler.join("; ");
}

export function clearSessionCookie(): string {
  const options = getSessionCookieOptions();
  const deler = [
    `${SESSION_COOKIE_NAME}=`,
    "Max-Age=0",
    `Path=${options.path}`,
    `SameSite=${options.sameSite}`,
  ];
  if (options.httpOnly) deler.push("HttpOnly");
  if (options.secure) deler.push("Secure");
  return deler.join("; ");
}
