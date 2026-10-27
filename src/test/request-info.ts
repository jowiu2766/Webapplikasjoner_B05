import type { RequestInfo } from "rwsdk/worker";
import type { DB } from "@/db";
import type { TestDb } from "@/test/db";

export function lagRequestInfo(url: string, db: TestDb,  params: Record<string, string> = {}): RequestInfo {
  return {
    request: new Request(url),
    path: new URL(url).pathname,
    params,
    ctx: {db: db as unknown as DB, user: null, session: null },
    rw: {
      nonce: "test-nonce",
      Document: ({ children }) => children,
      rscPayload: false,
      ssr: true,
      databases: new Map(),
      scriptsToBeLoaded: new Set(),
      entryScripts: new Set(),
      inlineScripts: new Set(),
      pageRouteResolved: undefined,
    },
    // Finnes bare i workerd. Ingen hos oss leser den.
    cf: {} as ExecutionContext,
    response: { status: 200, headers: new Headers() },
    isAction: false,
  };
}
