import type { RequestInfo } from "rwsdk/worker";
import type { DB } from "@/db";
import type { SafeUser } from "@/db/schema";
import type { TestDb } from "@/test/db";

type Valg<P> = {
  db?: TestDb;
  params?: P;
  // hvem som er logget inn. null er det Authentication-middlewaren setter uten sesjon
  user?: SafeUser | null;
};

export function lagRequestInfo<P extends Record<string, string> = Record<string, string>>(
  url: string,
  { db, params = {} as P, user = null }: Valg<P> = {},
): RequestInfo<P> {
  return {
    request: new Request(url),
    path: new URL(url).pathname,
    params,
    ctx: { db: db as unknown as DB, user, session: null },
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
