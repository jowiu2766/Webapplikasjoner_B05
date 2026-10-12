import {z} from "zod";

//login DTO schemas
export const LoginDTOSchema = z.object({
    username: z.string().min(3).max(8),
    password: z.string().min(8),
});

//registe DTO schemas
export const RegisterDTOSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.email(),
    password: z.string().min(8),
});

//user DTO for response(never incluides password hash)
export const UserDTOSchema = z.object({
    id: z.coerce.number(),
    username: z.string(),
    email: z.string(),
    role: z.enum(["Unauthenticated" , "Tenant" , "Landlord" , "Admin"]),
    isActive: z.boolean(),
    lastLoginAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
});

//Session DTO
export const SessionDTOSchema = z.object({
    id: z.string(),
    userId: z.coerce.number(),
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