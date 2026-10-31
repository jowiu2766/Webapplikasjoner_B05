"use server";

import { authService } from "./authService";
import { Errors } from "@/types/errors";
import { SafeUser, Session } from "@/db/schema";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { requestInfo } from "rwsdk/worker";
import { ServerResult } from "@/types/result";
import { UserDTO } from "@/lib/schema/auth-dtos";

export async function register(prevState: any, formData: FormData): Promise<ServerResult<{user: SafeUser, session: Session}>>{
    try{
        //Schema bruker feltvavnet "username" mens service kalled det name
        const credentials = {
            name: formData.get("username") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            address: formData.get("address") as string

        };

        const result = await authService.register(credentials);
        //Test to check if the regustriaiton works by writing to log
        //console.log("Registration result:", result);

        if(!result.success) {
            return{
                success: false,
                error: result.error.message,
                code: result.error.code,
                state: {name: credentials.name, email: credentials.email},
            };
        }

        //Muates the header so the cookie is set. could be moved to a util
        requestInfo.response.headers.append("Set-Cookie", setSessionCookie(result.data.session.id))
     
        return{
            success: true,
            data: {
                user: result.data.user,
                session: result.data.session,
            },
        }
    }catch(error){
        console.error("Register action error:", error);
        return {
            success: false,
            error: "Registration failed",
            code: Errors.INTERNAL_SERVER_ERROR,
            state: Object.fromEntries(formData.entries()),
        };
    }
}

export async function login(prevState: any, formData: FormData):Promise<ServerResult<{ user: UserDTO; session: Session }>> {
    try{
        const credentials = {
            name: formData.get("username") as string,
            password: formData.get("password") as string,
        };
        const result = await authService.login(credentials);
        if(!result.success){
            return{
                success: false,
                error: result.error.message,
                code: result.error.code,
                state: {name: credentials.name}
            };
        }
        requestInfo.response.headers.append("Set-Cookie", setSessionCookie(result.data.session.id))


        
        return{
            success: true,
            data: {
                user: result.data.user,
                session: result.data.session,
            },
        }
    }catch(error){
        console.error("Register action error:", error);
        return {
            success: false,
            error: "Registration failed",
            code: Errors.INTERNAL_SERVER_ERROR,
            state: Object.fromEntries(formData.entries()),
        };
    }
}

export async function logout(): Promise<ServerResult<null>> {
    try{
        const sessionId = requestInfo.ctx.session?.id;
        const result = await authService.logout(sessionId);

        if(!result.success){
            return{
                success: false,
                error: result.error.message,
                code: result.error.code
            };
        }

        const cookie = clearSessionCookie();;
        requestInfo.response.headers = {
            ...requestInfo.response.headers,
            "Set-Cookie": cookie,
        };
        return{
            success: true,
            data: null,
        };
        
    }catch(error){
        console.error("Logout action error:", error);
        return{
            success: false,
            error: "LOutout failed",
            code: Errors.INTERNAL_SERVER_ERROR,
        }
    }
};