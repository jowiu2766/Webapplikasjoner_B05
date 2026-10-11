import { authRepository, type AuthRepository } from "./authRepository";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/auth/password";

import type { LoginCredentials, RegisterCredentials } from "@/types/authorisation";
import type { SafeUser, Session } from "@/db/schema";
import { Result } from "@/types/result";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";

import { createSession, deleteSession } from "@/lib/auth/session";
import userEvent from "@testing-library/user-event";
import { LoginDTOSchema, RegisterDTOSchema } from "@/lib/schema/auth-dtos";

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
         try{
            const validation = RegisterDTOSchema.safeParse(credentials);
            if(!validation.success){
                return ResultHandler.failure(`Validation failed: ${validation.error.message}`, Errors.VALIDATION_ERROR);
            }
            const {username, email, password} = validation.data;

            //Validate password strenght
            const passwordValidation = validatePasswordStrength(password);
            if(!passwordValidation.isValid) return ResultHandler.failure(passwordValidation.errors.join(", "), Errors.VALIDATION_ERROR);

            //Check if email or username already exists - crashes due to simeltnaous requests on AQLisite
            const existingUserByEmail = await authRepository.findUserByEmail(email);
            const existingUserByUsername = await authRepository.findUserByUsername(username);
            
            if(!existingUserByEmail.success || !existingUserByUsername.success) 
                return ResultHandler.failure("Error when checking credientials", Errors.INTERNAL_SERVER_ERROR);

            if(existingUserByEmail.data || existingUserByUsername.data) 
                return ResultHandler.failure("Existing user found", Errors.CONFLICT);

            //hash password
            const passwordHash = await hashPassword(password);
            //create user
            const createUserResult = await authRepository.createUser({
                username, email, passwordHash, role: "Unauthenticated",
            });
            if(!createUserResult.success)
                return ResultHandler.failure(createUserResult.error, Errors.INTERNAL_SERVER_ERROR);

            const newUser = createUserResult.data;

            //create session
            const session = await createUserSession(newUser.id);
            return ResultHandler.sucsess({user: newUser, session});
         }catch(error){
            console.error("Registration error:", error);
            return ResultHandler.failure("Registration failed", Errors.INTERNAL_SERVER_ERROR);
         }

        },

        async login(credentials){
            try{
                //validate input
                const validation = LoginDTOSchema.safeParse(credentials);
                if(!validation.success) 
                    return ResultHandler.failure("Illegal username or password", Errors.UNAUTHORIZED);
                
                
                const{username, password} = validation.data;

                //Find user by username
                const userResult = await authRepository.findUserByUsername(username);
                if(!userResult.success) 
                    return ResultHandler.failure(userResult.error, Errors.INTERNAL_SERVER_ERROR);
                if(userResult.data) 
                    return ResultHandler.failure("Ilegal username or password", Errors.UNAUTHORIZED);

                const {id, passwordHash, isActive} = userResult.data;
                if(!isActive) 
                    return ResultHandler.failure("The account is dactivated", Errors.FORBIDDEN);
                //vertiy password
                const isPasswordValid = await verifyPassword(password, passwordHash);
                if(!isPasswordValid) 
                    return ResultHandler.failure("Ilegal username or password", Errors.UNAUTHORIZED);

                //create session
                const session = await createUserSession(id);
                const safeUser = map

            }
        }


    }
}

export const authService = createAuthService(authRepository);