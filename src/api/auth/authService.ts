import { authRepository, type AuthRepository } from "./authRepository";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/auth/password";

import type { LoginCredentials, RegisterCredentials } from "@/types/authorisation";
import type { SafeUser, Session } from "@/db/schema";
import { Result } from "@/types/result";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";

import { createSession, deleteSession } from "@/lib/auth/session";
import userEvent from "@testing-library/user-event";

export interface AuthService{
    register(credentials: RegisterCredentials,): Promise<Result<{user: SafeUser; session: Session}>>;
    login(credentials: LoginCredentials,): Promise<Result<{user: SafeUser; session: Session}>>;
    logout(sessionId?: string): Promise<Result<void>>;
    createAdminUser(credentials: RegisterCredentials,): Promise<Result<{user: SafeUser; session: Session}>>;
    currentUser(userId: number): Promise<Result<SafeUser>>;
}

export function createAuthService(authRepository: AuthRepository): AuthService{
    //simple helpder to handle faiulure on session creation, prevent DRY since it is used multiple times
    const createUserSession = async (userId: number) =>{
        const sessionResult =await createSession(userId);
        if(!sessionResult.success){
            throw new Error("Failed to create session");
        }
        return sessionResult.data;
    };

    return{
        //often used in fortent to get the current user data in a hook or contest. 
        // user ID is provided by the contesxt given from redwood and the midelware thgat sets the user and session

        async currentUser(userId){
            try{
                const userResult = await authRepository.findUserById(userId);
                if(!userResult.success){
                    return ResultHandler.failure(userResult.error, Errors.INTERNAL_SERVER_ERROR);
                }
                return ResultHandler.sucsess(userResult.data);
            }catch(error){
                console.error("Error fetching current user:", error);
                return ResultHandler.failure("Failed to fetch current user", Errors.INTERNAL_SERVER_ERROR);
            }
        },
        async register(credentials){
         //validate input with DTO schema   
        }

    }
}

export const authService = createAuthService(authRepository);