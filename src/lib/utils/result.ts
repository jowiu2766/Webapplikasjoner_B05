import type { ResultData, ResultFunction } from "@/types/result";
import type { Pagination } from "@/types/api";
import { Errors, type ErrorCode, type ResultError } from "@/types/errors";

export const ResultHandler: ResultFunction = {
  success<T>(data: T, pagination?: Pagination): ResultData<T> {
    return { success: true, data, pagination };
  },
  failure(error: unknown, code: ErrorCode = Errors.INTERNAL_SERVER_ERROR): ResultError {
    let message = "";
    if (typeof error === "string") message = error;
    else if (error instanceof Error) message = error.message;
    else if (error && typeof error === "object") message = JSON.stringify(error);
    return { success: false, error: { message, code } };
  },
};
