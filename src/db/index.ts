//import { drizzle } from "drizzle-orm/d1";
//import type { SQLiteAsyncDatabase } from "drizzle-orm/sqlite-core";
//import { env } from "cloudflare:workers";
import * as schema from "./schema";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";

/**
 * Én Drizzle-klient mot D1.
 *
 * I Drizzle v1 sendes `relations` inn her, ikke `schema`. Tabellene leses ut
 * av relasjonsobjektet.
 *
 * Klienten lages på modulnivå, og det er trygt: `env` er request-scopet bak
 * kulissene. Det som IKKE er trygt, er å legge noe som gjelder én bruker, som
 * en sesjon, i en modulvariabel. Da deles den mellom alle.
 */
let dbInstance: DrizzleD1Database<typeof schema> |null = null;

async function getWorkerEnv(): Promise<D1Database>{
    try{
        const {env} = await import("cloudflare:workers");

        if(!env || !env.DB){
            throw new Error("D1 database instance not found in worker enviroment");
        }
        return env.DB as D1Database;        
    }catch(error){
        throw new Error("Failed to get D1 databsae instance from wokrer enviroment");
    }
}
//Factory fucntion that accepts a D1 databse instnace
export function createDatabase(d1Database: D1Database): DrizzleD1Database<typeof schema>{
    if (!d1Database){
        throw new Error("D1 Databse is required");
    }
    return drizzle(d1Database, {schema});
}

//Setup database with Provided D1 instance
export function setupDb(d1Database: D1Database){
    if(dbInstance){
        return dbInstance;
    }
    dbInstance = createDatabase(d1Database);
    return dbInstance;
}


export async function getDb(): Promise<DrizzleD1Database<typeof schema>> {
    if(!dbInstance){
        dbInstance = createDatabase(await getWorkerEnv());
    }
    return dbInstance;
}
export type DB = DrizzleD1Database<typeof schema>;