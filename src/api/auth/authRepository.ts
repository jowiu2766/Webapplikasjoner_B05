import { db } from "@/db";
import { user } from "@/db/schema";
import type { User, CreateUser, SafeUser } from "@/db/schema";
import type { Result } from "@/types/result";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";
import { eq } from "drizzle-orm";

export interface AuthRepository {
  findUserByName(name: string): Promise<Result<User | null>>;
  findUserByEmail(email: string): Promise<Result<User | null>>;
  findUserById(id: string): Promise<Result<User | null>>;
  createUser(data: CreateUser): Promise<Result<SafeUser>>;
  updateLastLogin(userId: string): Promise<Result<void>>;
}

const safeColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  role: user.role,
  image: user.image,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLoginAt: user.lastLoginAt,
  isActive: user.isActive,
  address: user.address,
};

export function createAuthRepository(_db: typeof db): AuthRepository {
  return {
    async findUserByName(name) {
      try {
        const result = await _db.select().from(user).where(eq(user.name, name)).limit(1);
        return ResultHandler.success(result[0] ?? null);
      } catch (error) {
        console.error("Error finding user by name:", error);
        return ResultHandler.failure("Failed to find user", Errors.INTERNAL_SERVER_ERROR);
      }
    },
    async findUserByEmail(email) {
      try {
        const result = await _db.select().from(user).where(eq(user.email, email)).limit(1);
        return ResultHandler.success(result[0] ?? null);
      } catch (error) {
        console.error("Error finding user by email:", error);
        return ResultHandler.failure("Failed to find user", Errors.INTERNAL_SERVER_ERROR);
      }
    },
    async findUserById(id) {
      try {
        const result = await _db.select().from(user).where(eq(user.id, id)).limit(1);
        return ResultHandler.success(result[0] ?? null);
      } catch (error) {
        console.error("Error finding user by id:", error);
        return ResultHandler.failure("Failed to find user", Errors.INTERNAL_SERVER_ERROR);
      }
    },
    async createUser(data) {
      try {
        const [newUser] = await _db.insert(user).values(data).returning(safeColumns);
        return ResultHandler.success(newUser);
      } catch (error) {
        console.error("Error creating user:", error);
        return ResultHandler.failure("Failed to create user", Errors.INTERNAL_SERVER_ERROR);
      }
    },
    async updateLastLogin(userId) {
      try {
        await _db.update(user).set({ lastLoginAt: new Date() }).where(eq(user.id, userId));
        return ResultHandler.success(undefined);
      } catch (error) {
        console.error("Error updating last login:", error);
        return ResultHandler.failure("Failed to update last login", Errors.INTERNAL_SERVER_ERROR);
      }
    },
  };
}

export const authRepository = createAuthRepository(db);
