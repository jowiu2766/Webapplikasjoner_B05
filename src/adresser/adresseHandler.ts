import type { RequestInfo } from "rwsdk/worker";
import { z } from "zod";
import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";
import { sokAdresser, type FetchFn } from "./adresseApi";

const sokSchema = z.string().trim().min(2).max(100);

export function lagAdresseHandler(fetchFn: FetchFn = fetch) {
  return async ({ request }: Pick<RequestInfo, "request">): Promise<Response> => {
    if (request.method !== "GET") {
      return Response.json(
        ResultHandler.failure("Bruk GET", Errors.METHOD_NOT_ALLOWED),
        { status: 405 },
      );
    }

    const sok = sokSchema.safeParse(
      new URL(request.url).searchParams.get("sok") ?? "",
    );
    if (!sok.success) {
      return Response.json(
        ResultHandler.failure("sok må være 2 til 100 tegn", Errors.BAD_REQUEST),
        { status: 400 },
      );
    }

    const result = await sokAdresser(sok.data, fetchFn);
    return Response.json(result, { status: result.success ? 200 : 502 });
  };
}

export const adresseHandler = lagAdresseHandler();
