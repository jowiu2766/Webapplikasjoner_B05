import { authRepository, type AuthRepository } from "./authRepository";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/auth/password";
import type { LoginCredentials, RegisterCredentials } from "@/types/authorisation";
import type { SafeUser, Session } from "@/db/schema";
import type { Result } from "@/types/result";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";
import { createSession, deleteSession } from "@/lib/auth/session";
import { LoginDTOSchema, RegisterDTOSchema } from "@/lib/schema/auth-dtos";
import { createId } from "@/lib/id";

export interface AuthService {
  register(credentials: RegisterCredentials): Promise<Result<{ user: SafeUser; session: Session }>>;
  login(credentials: LoginCredentials): Promise<Result<{ user: SafeUser; session: Session }>>;
  logout(sessionId?: string): Promise<Result<void>>;
  currentUser(userId: string): Promise<Result<SafeUser>>;
}

export function createAuthService(authRepository: AuthRepository): AuthService {
  const createUserSession = async (userId: string) => {
    const sessionResult = await createSession(userId);
    if (!sessionResult.success) {
      throw new Error("Failed to create session");
    }
    return sessionResult.data;
  };

  return {
    async currentUser(userId) {
      try {
        const userResult = await authRepository.findUserById(userId);
        if (!userResult.success) {
          return ResultHandler.failure(userResult.error, Errors.INTERNAL_SERVER_ERROR);
        }
        if (!userResult.data) return ResultHandler.failure("User not found", Errors.NOT_FOUND);
        return ResultHandler.success(userResult.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        return ResultHandler.failure("Failed to fetch current user", Errors.INTERNAL_SERVER_ERROR);
      }
    },

    async register(credentials) {
      try {
        const validation = RegisterDTOSchema.safeParse(credentials);
        if (!validation.success) {
          return ResultHandler.failure(`Validation failed: ${validation.error.message}`, Errors.VALIDATION_ERROR);
        }
        const { username, email, password, role } = validation.data;

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
          return ResultHandler.failure(passwordValidation.errors.join(", "), Errors.VALIDATION_ERROR);
        }

        const existingByEmail = await authRepository.findUserByEmail(email);
        const existingByName = await authRepository.findUserByName(username);
        if (!existingByEmail.success || !existingByName.success) {
          return ResultHandler.failure("Error when checking credentials", Errors.INTERNAL_SERVER_ERROR);
        }
        if (existingByEmail.data || existingByName.data) {
          return ResultHandler.failure("Existing user found", Errors.CONFLICT);
        }

        const passwordHash = await hashPassword(password);
        const created = await authRepository.createUser({
          id: createId(),
          name: username,
          email,
          passwordHash,
          role,
        });
        if (!created.success) {
          return ResultHandler.failure(created.error, Errors.INTERNAL_SERVER_ERROR);
        }

        const session = await createUserSession(created.data.id);
        return ResultHandler.success({ user: created.data, session });
      } catch (error) {
        console.error("Registration error:", error);
        return ResultHandler.failure("Registration failed", Errors.INTERNAL_SERVER_ERROR);
      }
    },

    async login(credentials) {
      try {
        const validation = LoginDTOSchema.safeParse(credentials);
        if (!validation.success) {
          return ResultHandler.failure("Illegal username or password", Errors.UNAUTHORIZED);
        }
        const { username, password } = validation.data;

        const userResult = await authRepository.findUserByName(username);
        if (!userResult.success) {
          return ResultHandler.failure(userResult.error, Errors.INTERNAL_SERVER_ERROR);
        }
        if (!userResult.data || !userResult.data.passwordHash) {
          return ResultHandler.failure("Illegal username or password", Errors.UNAUTHORIZED);
        }

        const { id, passwordHash, isActive, ...rest } = userResult.data;
        if (!isActive) {
          return ResultHandler.failure("The account is deactivated", Errors.FORBIDDEN);
        }
        const isPasswordValid = await verifyPassword(password, passwordHash);
        if (!isPasswordValid) {
          return ResultHandler.failure("Illegal username or password", Errors.UNAUTHORIZED);
        }

        await authRepository.updateLastLogin(id);
        const session = await createUserSession(id);
        return ResultHandler.success({ user: { id, isActive, ...rest }, session });
      } catch (error) {
        console.error("Login error:", error);
        return ResultHandler.failure("Login failed", Errors.INTERNAL_SERVER_ERROR);
      }
    },

    async logout(sessionId) {
      try {
        if (!sessionId) return ResultHandler.success(undefined);
        return await deleteSession(sessionId);
      } catch (error) {
        console.error("Logout error:", error);
        return ResultHandler.failure("Logout failed", Errors.INTERNAL_SERVER_ERROR);
      }
    },
  };
}

export const authService = createAuthService(authRepository);
