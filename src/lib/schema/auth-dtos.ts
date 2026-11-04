import {z} from "zod";

//login DTO schemas
export const LoginDTOSchema = z.object({
    username: z.string().min(3).max(30),
    password: z.string().min(8),
});

//registe DTO schemas
export const RegisterDTOSchema = z.object({
    name: z.string().min(3).max(30),
    email: z.email(),
    password: z.string().min(8),
    address: z.string().min(1),
    role: z.enum(["Tenant", "Landlord"]),
});

//user DTO for response(never incluides password hash)
export const UserDTOSchema = z.object({
    id: z.coerce.string(),
    name: z.string().trim(),
    email: z.string().trim().email(),
    role: z.enum(["Unauthenticated" , "Tenant" , "Landlord" , "Admin"]),
    isActive: z.boolean(),
    lastLoginAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
    address: z.string().trim()
});

//Session DTO
export const SessionDTOSchema = z.object({
    id: z.string(),
    userId: z.coerce.string(),
    expiresAt: z.date(),
    createdAt: z.date(),
});

//Auth response DTO
export const AuthResponseDTOSchema = z.object({
    user: UserDTOSchema,
    session: SessionDTOSchema,
});

//types
export type LoginDTO = z.infer<typeof LoginDTOSchema>;
export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;
export type UserDTO = z.infer<typeof UserDTOSchema>;
export type SessionDTO = z.infer<typeof SessionDTOSchema>;
export type AuthResponseDTO = z.infer<typeof AuthResponseDTOSchema>;