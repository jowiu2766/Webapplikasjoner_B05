import z from "zod";
import { caseService, CaseService } from "./caseService";
import { createCaseSchema } from "./caseSchema";
import type { RequestInfo } from "rwsdk/worker";
import { statusFor } from "@/types/errors";

export function createCaseController(caseService: CaseService) {
  return {
    async createCase(ctx: RequestInfo) {
      try {
        const user = ctx.ctx.user;

        if (!user)
          return Response.json(
            { error: "Du må være logget inn" },
            { status: 401 },
          );

        if (user.role !== "Tenant")
          return Response.json(
            { error: "Bare leietakere kan opprette saker" },
            { status: 403 },
          );

        const requestData = await ctx.request.json();
        const parsed = createCaseSchema.safeParse(requestData);

        if (!parsed.success) {
          return Response.json(
            {
              error: "Validation failed",
              fields: z.flattenError(parsed.error).fieldErrors,
            },
            { status: 400 },
          );
        }

        const result = await caseService.create(parsed.data, user);

        if (!result.success) {
          const { error } = result;
          const { message, code } = error;
          return new Response(JSON.stringify({ error: message }), {
            status: statusFor[code],
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result.data), {
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
