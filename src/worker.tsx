import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/Home";
import { SakerList } from "@/app/pages/saker/List";
import { NewCase } from "@/app/pages/saker/NewCase";
import { SakDetalj } from "@/app/pages/saker/Detail";
import LoginPage from "@/components/auth/pages/LoginPage";
import RegisterPage from "@/components/auth/pages/RegisterPage";
import { authenticationMiddelware } from "@/middelWare/Authentication";
import type { AuthContext } from "@/types/authorisation";

/**
 * Alt som ligger på `ctx` for én forespørsel. `user` og `session` settes av
 * authenticationMiddelware, og er null når ingen er logget inn.
 */
export type AppContext = AuthContext;

const app = defineApp([
  // Middleware. Kjører for hver forespørsel, i rekkefølgen de står.
  setCommonHeaders(),
  authenticationMiddelware,

  // API-rute. Ligger UTENFOR render(), så svaret er akkurat det handleren
  // returnerer: JSON, uten HTML-skall rundt.
  route("/api/status", () => Response.json({ status: "ok", version: "0.1.0" })),

  // Sider. render(Document, [...]) pakker dem i et helt HTML-dokument.
  render(Document, [
    route("/", Home),
    route("/saker", SakerList),
    route("/saker/ny", NewCase),
    // Etter /saker/ny, ellers tolkes «ny» som en id.
    route("/saker/:id", SakDetalj),
    route("/auth/login", LoginPage),
    route("/auth/register", RegisterPage),
  ]),
]);

export default { fetch: app.fetch };
