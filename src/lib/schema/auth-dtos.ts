import { z } from "zod";
import { userRoles } from "@/lib/enums";

export const LoginDTOSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8),
});

export const RegisterDTOSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(userRoles).default("tenant"),
});

// Aldri passordhash ut.
export const UserDTOSchema = z.object({
  id: z.string(),
  name: z.string().trim(),
  email: z.string().trim(),
  role: z.enum(userRoles),
  isActive: z.boolean(),
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SessionDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const AuthResponseDTOSchema = z.object({
  user: UserDTOSchema,
  session: SessionDTOSchema,
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;
export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;
export type UserDTO = z.infer<typeof UserDTOSchema>;
export type SessionDTO = z.infer<typeof SessionDTOSchema>;
export type AuthResponseDTO = z.infer<typeof AuthResponseDTOSchema>;
