
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";
import type { Result } from "@/types/result";

export async function executeDbOperation<T>(operation: () => Promise<T>) : Promise<Result<T>>{
    try{
        const result = await operation();
        return ResultHandler.success(result);
    }catch(error){
        console.error("Databsae operation  faoeld:", error);
        return ResultHandler.failure(error, Errors.INTERNAL_SERVER_ERROR);
    }
}

export async function executePaginatedDbOperation<T>(operation: () => Promise<T>): Promise<Result<T>> {
    return executeDbOperation(operation);
}