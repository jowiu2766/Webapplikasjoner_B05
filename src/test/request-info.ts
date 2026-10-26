import type { RequestInfo } from "rwsdk/worker";

export function lagRequestInfo(url: string, params: Record<string, string> = {}): RequestInfo {
  return {
    request: new Request(url),
    path: new URL(url).pathname,
    params,
    ctx: {},
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
