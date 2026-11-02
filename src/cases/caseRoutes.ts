import { route } from "rwsdk/router";
import { caseController } from "./caseController";

export const caseRoutes = route("/api/saker", (requestInfo) =>
  requestInfo.request.method === "POST"
    ? caseController.createCase(requestInfo)
    : Response.json({ error: "Method Not Allowed" }, { status: 405 }),
);
