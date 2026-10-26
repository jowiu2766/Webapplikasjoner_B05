"use server";

import { authService } from "./authService";
import { Errors } from "@/types/errors";
import type { SafeUser, Session } from "@/db/schema";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { requestInfo } from "rwsdk/worker";
import type { ServerResult } from "@/types/result";
import { userRoles, type UserRole } from "@/lib/enums";

type AuthResult = ServerResult<{ user: SafeUser; session: Session }>;

function lesRolle(formData: FormData): UserRole {
  const rolle = formData.get("role");
  return userRoles.find((r) => r === rolle) ?? "tenant";
}

export async function register(_prevState: unknown, formData: FormData): Promise<AuthResult> {
  const credentials = {
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: lesRolle(formData),
  };
  try {
    const result = await authService.register(credentials);
    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.code,
        state: { username: credentials.username, email: credentials.email },
      };
    }
    requestInfo.response.headers.set("Set-Cookie", setSessionCookie(result.data.session.id));
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Register action error:", error);
    return {
      success: false,
      error: "Registration failed",
      code: Errors.INTERNAL_SERVER_ERROR,
      state: { username: credentials.username, email: credentials.email },
    };
  }
}

export async function login(_prevState: unknown, formData: FormData): Promise<AuthResult> {
  const credentials = {
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  try {
    const result = await authService.login(credentials);
    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
        code: result.error.code,
        state: { username: credentials.username },
      };
    }
    requestInfo.response.headers.set("Set-Cookie", setSessionCookie(result.data.session.id));
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "Login failed",
      code: Errors.INTERNAL_SERVER_ERROR,
      state: { username: credentials.username },
    };
  }
}

export async function logout(): Promise<ServerResult<null>> {
  try {
    const result = await authService.logout(requestInfo.ctx.session?.id);
    if (!result.success) {
      return { success: false, error: result.error.message, code: result.error.code };
    }
    requestInfo.response.headers.set("Set-Cookie", clearSessionCookie());
    return { success: true, data: null };
  } catch (error) {
    console.error("Logout action error:", error);
    return { success: false, error: "Logout failed", code: Errors.INTERNAL_SERVER_ERROR };
  }
}
