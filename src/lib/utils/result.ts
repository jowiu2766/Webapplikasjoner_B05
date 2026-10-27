import type {ResultFunction} from "@/types/result";
import {Errors} from "@/types/errors";

export const ResultHandler: ResultFunction ={
    sucsess(data, pagination){
        return{ success: true, data, ...pagination};
    },
    failure(error: unknown, code = Errors.INTERNAL_SERVER_ERROR){
        let message = "";
        if (typeof error === "string") message = error;
        else if (error instanceof Error) message = error.message;
        else if ( error != null && typeof error === "object" && message != null) message = JSON.stringify(error);
        return {sucsess: false, error: {message: message, code}};
    },
};