import z from "zod";
import { caseService, CaseService } from "./caseService";
import { createCaseSchema } from "./caseSchema";
import { ErrorCode } from "@/types/errors";

export const statusFor: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  NOT_UNIQUE: 409,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
};

// Implementeres senere
export function createCaseController(caseService: CaseService) {
  return {
    async createCase(ctx: RequestInfo) {
      try {
        const requestData = await ctx.request.json();
        const validatedData = createCaseSchema.parse(requestData);

        const result = await caseService.create(validatedData);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            statusFor[code]: code || 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error(`Error in createCase:`, error);

        if (error instanceof SyntaxError) {
          return new Response(
            JSON.stringify({ error: "Invalid JSON in request body" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (error instanceof z.ZodError) {
          return new Response(
            JSON.stringify({
              error: `Validation failed: ${z.flattenError(error).fieldErrors}`,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(
          JSON.stringify({
            error: "An unexpected error occurred. Please try again later.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    },
  };
}

export const caseController = createCaseController(caseService);
