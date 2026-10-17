import { SafeUser, Session } from "@/db/schema";
import { SessionDTO, UserDTO, AuthResponseDTO } from "../schema/auth-dtos";

//mas SafeUser to UserDTO - in general doing nothing
export function mapUserToDTO(user: SafeUser): UserDTO{
    return{
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export function mapSessionToDTO(session: Session): SessionDTO{
    return{
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
    };
}
export function mapAuthResponseToDTO(user: SafeUser, session: Session): AuthResponseDTO{
    return{
        user: mapUserToDTO(user),
        session: mapSessionToDTO(session),
    };
}