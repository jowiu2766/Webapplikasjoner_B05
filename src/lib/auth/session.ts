//import {getDb} from "@/db";

const SESSION_DURATION = 7 * 24 * 60 * 60 *1000; //7 days
export const SESSION_COOKIE_NAME = "fika_session_cookie";

//Create new session
export async function createSession(userId: number):  Promise<Result<Session>> {
    try{
        const db = await getDb();
    }
    
}
//Gets session & user data

//Delete a session (logout)

//Cleanup expired sesisons

//session cookie configuration

//Helper function to extract session id from cookies

//HElper function to exctact session ID from cookies

//Helper func tion to set session cookie

//Helper function to clear session cookie

//