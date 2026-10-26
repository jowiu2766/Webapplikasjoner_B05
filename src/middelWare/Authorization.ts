import type { AppContext } from "@/worker";
import type { UserRole } from "@/lib/enums";
import { Errors } from "../types/errors";
import { hasRole } from "../lib/auth/roles";

function tilInnlogging() {
  return new Response(null, { status: 302, headers: { Location: "/auth/login" } });
}

function forbudt(message: string) {
  return new Response(JSON.stringify({ error: { code: Errors.FORBIDDEN, message } }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

export function reqAuthorization() {
  return ({ ctx }: { ctx: AppContext }): Response | void => {
    if (!ctx.user) return tilInnlogging();
    if (!ctx.user.isActive) return forbudt("Account deactivated");
  };
}

export function requireRole(role: UserRole) {
  return ({ ctx }: { ctx: AppContext }): Response | void => {
    if (!ctx.user) return tilInnlogging();
    if (!hasRole(ctx.user, role)) return forbudt("Not proper rights");
  };
}
