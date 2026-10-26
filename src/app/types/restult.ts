import { ErrorCode, ResultError } from "./errors";

// pagination må bli lagt til her også om vi skal ha med det
export type ResultData<T> = {
  success: true;
  data: T;
};

export type Result<T> = ResultData<T> | ResultError;

export type ResultFn = {
  success: <T>(data: T) => ResultData<T>;
  failure: (error: unknown, code: ErrorCode) => ResultError;
};

export type ServerResult<T, U extends Record<string, unknown> = {}> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: string;
      fieldErrors?: Record<string, string[]>;
      state?: U;
    };
