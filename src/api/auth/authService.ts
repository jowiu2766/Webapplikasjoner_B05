import { authRepository, type AuthRepository } from "./authRepository";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/auth/password";

import type { LoginCredentials, RegisterCredentials } from "@/types/authorisation";
import type { SafeUser, Session } from "@/db/schema";
import { Result } from "@/types/result";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";
import type { UserDTO } from "@/lib/schema/auth-dtos";
import { createSession, deleteSession } from "@/lib/auth/session";
import { LoginDTOSchema, RegisterDTOSchema } from "@/lib/schema/auth-dtos";
import { mapUserToDTO } from "@/lib/mappers/auth";

export interface AuthService{
    register(credentials: RegisterCredentials,): Promise<Result<{user: SafeUser; session: Session}>>;
    login(credentials: LoginCredentials): Promise<Result<{ user: UserDTO; session: Session }>>;
    logout(sessionId?: string): Promise<Result<void>>;
    createAdminUser(credentials: RegisterCredentials,): Promise<Result<{user: SafeUser; session: Session}>>;
    currentUser(userId: string): Promise<Result<SafeUser>>;
}

export function createAuthService(authRepository: AuthRepository): AuthService{
    //simple helpder to handle faiulure on session creation, prevent DRY since it is used multiple times
    const createUserSession = async (userId: string) =>{
        const sessionResult = await createSession(userId);
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
                if(!userResult.data) return ResultHandler.failure("User not found", Errors.NOT_FOUND);

                return ResultHandler.success(userResult.data);
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
            const {name, email, password, address} = validation.data;

            //Validate password strenght
            const passwordValidation = validatePasswordStrength(password);
            if(!passwordValidation.isValid) return ResultHandler.failure(passwordValidation.errors.join(", "), Errors.VALIDATION_ERROR);

            //Check if email or username already exists - crashes due to simeltnaous requests on AQLisite
            const existingUserByEmail = await authRepository.findUserByEmail(email);
            const existingUserByUsername = await authRepository.findUserByUsername(name);
            
            if(!existingUserByEmail.success || !existingUserByUsername.success) 
                return ResultHandler.failure("Error when checking credientials", Errors.INTERNAL_SERVER_ERROR);

            if(existingUserByEmail.data || existingUserByUsername.data) 
                return ResultHandler.failure("Existing user found", Errors.CONFLICT);

            //hash password
            const passwordHash = await hashPassword(password);
            //create user
            const createUserResult = await authRepository.createUser({
                id: crypto.randomUUID(),
                name, email, passwordHash, address, role: "Unauthenticated",
            });
            if(!createUserResult.success)
                return ResultHandler.failure(createUserResult.error, Errors.INTERNAL_SERVER_ERROR);

            const newUser = createUserResult.data;

            //create session
            const session = await createUserSession(newUser.id);
            return ResultHandler.success({user: newUser, session});
         }catch(error){
            console.error("Registration error:", error);
            return ResultHandler.failure("Registration failed", Errors.INTERNAL_SERVER_ERROR);
         }

        },

        async login(credentials){
            try{
                //validate input
                const validation = LoginDTOSchema.safeParse({
                    username: credentials.name,
                    password: credentials.password
                });
                if(!validation.success) 
                    return ResultHandler.failure("Illegal username or password", Errors.UNAUTHORIZED);
                
                
                const{username, password} = validation.data;

                //Find user by username
                const userResult = await authRepository.findUserByUsername(username);
                if(!userResult.success) 
                    return ResultHandler.failure(userResult.error, Errors.INTERNAL_SERVER_ERROR);
                if(!userResult.data) 
                    return ResultHandler.failure("Ilegal username or password", Errors.UNAUTHORIZED);

                const { id, passwordHash, isActive} = userResult.data;
                if(!isActive) 
                    return ResultHandler.failure("The account is dactivated", Errors.FORBIDDEN);
                //vertiy password
                const isPasswordValid = await verifyPassword(password, passwordHash);
                if(!isPasswordValid) 
                    return ResultHandler.failure("Ilegal username or password", Errors.UNAUTHORIZED);

                //create session
                const session = await createUserSession(id);
                const safeUser = mapUserToDTO(userResult.data);
                return ResultHandler.success({user:safeUser, session});
            }catch(error){
                console.error("Login Error: ", error);
                return ResultHandler.failure("Login failed", Errors.INTERNAL_SERVER_ERROR);
            }
        },

        async logout(sessionId){
            if(!sessionId) 
                return ResultHandler.failure("Session IS is required", Errors.UNAUTHORIZED);
            return await deleteSession(sessionId);
        },

        async createAdminUser(credentials){
            try{
                //Check if admin alreasy exists
                const adminExist = await authRepository.findUserByUsername(credentials.name);
                if(!adminExist.success) return ResultHandler.failure(adminExist.error, Errors.INTERNAL_SERVER_ERROR);
                if(adminExist.data) return ResultHandler.failure("Existing user", Errors.CONFLICT);
                //validate
                const validation = RegisterDTOSchema.safeParse(credentials);
                if(!validation.success) return ResultHandler.failure(`Validation vaoided: ${validation.error.message}`, Errors.VALIDATION_ERROR);

                const {name,email, password, address} = validation.data;
                //validate password strenght
                const passwordValidation = validatePasswordStrength(password);
                if(!passwordValidation.isValid) return ResultHandler.failure(passwordValidation.errors.join(", "), Errors.VALIDATION_ERROR);

                //hash apssword
                const passwordHash = await hashPassword(password);
                //creatre admin user
                const createUserResult = await authRepository.createUser({
                    id: crypto.randomUUID(),
                    name, email, passwordHash,address,
                     role: "Admin",
                });

                if(!createUserResult.success) return ResultHandler.failure(createUserResult.error, Errors.INTERNAL_SERVER_ERROR);
                //create session
                const session = await createUserSession(createUserResult.data.id);
                return ResultHandler.success({user: createUserResult.data, session});
            }catch(error){
                console.error("Admin creation error", error);
                return ResultHandler.failure("Failed to create admin user", Errors.INTERNAL_SERVER_ERROR);
            }
        },
    };
}

export const authService = createAuthService(authRepository);