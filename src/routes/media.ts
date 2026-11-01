import { cases } from "@/db/schema";
import { storeUpload } from "@/lib/upload";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { eq } from "drizzle-orm";
import { route } from "rwsdk/router";

// Post
export const fileUploadRoute = route(
  "/api/saker/:caseId/fil",
  async ({ request, ctx, params }) => {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    if (!env.R2) {
      return Response.json({ error: "storage-unavailable" }, { status: 503 });
    }

    const db = await getDb();
    const formData = await request.formData();
    const result = await storeUpload(
      env.R2,
      formData,
      "file",
      "files",
      params.caseId,
    );
    if (!result.ok) {
      return Response.json({ error: result.error.message }, { status: 400 });
    }

    // Lagre nøkkelen i databasen: selve bildet bor i R2
    await db
      .update(cases)
      .set({ fileKey: result.key })
      .where(eq(cases.id, params.caseId));

    return Response.json({ fileKey: result.key }, { status: 200 });
  },
);

// Get - mulig denne må endres
export const mediaRoute = route("/media/*", async ({ params }) => {
  const key = params.$0; // hele resten av stien, skråstreker inkludert
  const object = await env.R2.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      // 30 dagers cache + immutable: bildet endres aldri (unikt key per upload)
      "Cache-Control": "public, max-age=2592000, immutable",
      // httpEtag (ikke etag): allerede sitert slik HTTP-spec krever
      ETag: object.httpEtag,
    },
  });
});
