import type {ResultFunction} from "@/types/result";
import {Errors} from "@/types/errors";

export const ResultHandler: ResultFunction ={
    sucsess(data, pagination){
        return{ success: true, data, ...pagination};
    },
    failure(error: unknown, code = Errors.INTERNAL_SERVER_ERROR){
        let err ="";
        if (typeof error === "string") err = error;
        if (typeof error === "object" && err != null) err = JSON.stringify(error);
        if (error instanceof Error) err = error.message;
        return {sucsess: false, error: {message: err, code}};
    },
};