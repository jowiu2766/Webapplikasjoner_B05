import type {SafeUser, Session} from "@/db/schema";

export interface AuthContext{
    user: SafeUser | null;
    session: Session | null;
}
export interface LoginCredentials{
    name: string; 
    password: string;

}
export interface RegisterCredentials{
    name: string; 
    email: string; 
    password: string;
    address: string
}