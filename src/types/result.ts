

import { StripTypeScriptTypesOptions } from "node:module";
import type { Pagination } from "./api";
import { ErrorCode, ResultError } from "./errors";

//sucsessful data response type
export type ResultData<T> ={
    success: true; data : T; pagination?: Pagination;
};

//result påatern for API responses
export type Result<T> = ResultData<T> | ResultError;

//result function type
export type ResultFunction ={
    success: <T>(data: T, pagination?: Pagination) => ResultData<T>;
    failure: (error: unknown, code: ErrorCode) => ResultError;
}

//Export server results function
export type ServerResult<T, U extends Record<string, unknown> = {}> = | {success: true; data: T} | {
    success: false; error: string; code?: string; fieldErrors?: Record<string,string[]>; state?: U;};