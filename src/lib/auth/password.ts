
import {hashPassword as hash,verifyPassword as verify,} from "better-auth/crypto";

//hash password uusing bcrypt
export async function hashPassword(password: string): Promise<string>{
    try{return await hash(password)}
    catch(error){
        console.error("Password hashing error:", error);
        throw new Error("Failed to nash password");
    }
}

//vertify password against it's hash
export async function verifyPassword(password: string, hash: string): Promise<boolean>{
    try{
        return await verify({password, hash});
    }catch(error){
        console.error("Password vertificaiton error:", error);
        return false;
    }
}

//validate password strenght
export function validatePasswordStrength(password:string):{isValid: boolean; errors: string[];}{
    const errors: string[] = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters");
    if(!/[a-z]/.test(password)) errors.push("Password have to inculde at least one small letter");
    if(!/[A-Z]/.test(password)) errors.push("Password have to include at least one large letter");
    if(!/\d/.test(password)) errors.push("Passowrd myst include at least one number");

    return{
        isValid: errors.length === 0,
        errors,
    };
}