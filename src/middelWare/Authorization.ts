import type { AppContext } from "@/worker";
import type { UserRole } from "@/db/schema";

import {Errors} from "../types/errors";
import {hasRole} from "../lib/auth/roles"
import { success } from "zod";
import { error } from "node:console";

export function reqAuthorization(){
    return({ctx}: {ctx: AppContext}) : Response | void => {
        if(!ctx.user){
            return new Response(
                JSON.stringify({
                    success: false, error: {
                        code: Errors.UNAUTHORIZED,
                        message: "Autentication requiered",
                    },
                }),
                {
                    status: 302, headers:{Location: "/auth/login"}

                }
            )
        }
        if(!ctx.user.isActive){
      return new Response(
        JSON.stringify({
          error: {
            code: Errors.FORBIDDEN,
            message: "Account deactivated",
          },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    };
}

export function redirectIfAuthenticated({ctx,}: {ctx: AppContext}): Response | void {
    if (ctx.user) return new Response(null, {status: 302, headers: { Location: "/"}})
}

//function for require role
export function requireRole(role: UserRole){
    return ({ctx}: {ctx: AppContext}): Response | void =>{
        if(!ctx.user){
            return new Response(null, {
                status: 302, headers: {Location: "/auth/login"},
            });
        }
        if(!hasRole(ctx.user, role)){
            return new Response(
                JSON.stringify({
                    error: {
                        code: Errors.FORBIDDEN,
                        message: "Not proper rights"
                    },
                }),{
                    status: 403,
                    headers: {"Content-Type": "application/json"},
                });
        }
    };
}

export function reqAdminRole(){
    return requireRole("Admin");
}