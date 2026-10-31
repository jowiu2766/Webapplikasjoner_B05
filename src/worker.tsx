import { defineApp } from "rwsdk/worker";
import { layout, render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/Home";
import { SakerList } from "@/app/pages/saker/List";
import { NewCase } from "./app/pages/saker/NewCase";
import { AppLayout } from "./app/pages/layouts/AppLayout";
//import { TestStateSceeen } from "@/app/pages/Screens/TestStateScreen";
import { headers } from "happy-dom/lib/PropertySymbol";
import { SafeUser } from "./db/schema";
import { AuthContext } from "./types/authorisation";
import { setupDb, type DB } from "@/db";
import { SakDetalj } from "@/app/pages/saker/Detail";
import { getDb } from "@/db";
import { authenticationMiddelware } from "./middelWare/Authentication";
import {
  reqAuthorization,
  redirectIfAuthenticated,
} from "./middelWare/Authorization";
import { fileUploadRoute, mediaRoute } from "./routes/media";
import LoginPage from "@/components/auth/pages/LoginPage";
import RegisterPage from "@/components/auth/pages/RegisterPage";

/**
 * Alt som ligger på `ctx` for én forespørsel.
 *
 * Tom nå. Legger dere til `user` her, blir `ctx.user` typet i hele appen,
 * fordi types/rw.d.ts mater denne typen inn i rwsdk.
 */
//Expand context to have auythcontext, prevent type errors using xtx.user or xtx.session
//*
//async function authMiddelware({ctx, request}){
//  const session = await auth.api.getSesstion({headers: request.headers});
//  ctx.user = session?.user ?? null;
//  ctx.role = getRole(ctx.user);}

export interface Env {
  DB: D1Database;
}

export type AppContext = {
  db: DB;
} & AuthContext;

const app = defineApp([
  // Middleware. Kjører for hver forespørsel, i rekkefølgen de står.
  setCommonHeaders(),
  authenticationMiddelware,

  // API-rute. Ligger UTENFOR render(), så svaret er akkurat det handleren
  // returnerer: JSON, uten HTML-skall rundt.
  route("/api/status", () => Response.json({ status: "ok", version: "0.1.0" })),
  fileUploadRoute,
  mediaRoute,

  // Sider. render(Document, [...]) pakker dem i et helt HTML-dokument.
  render(Document, [
    layout(AppLayout, [
      route("/", Home),

      //Login & registering
      route("/auth/login", [redirectIfAuthenticated, LoginPage ]),
      route("/auth/register",[redirectIfAuthenticated, RegisterPage ]),


      //Krever innloging, uten innloding sened dil til /auth/login
      route("/saker",  [reqAuthorization(), SakerList]),
      route("/saker/ny",  [reqAuthorization(), NewCase]),
      // etter /saker/ny, ellers tolkes «ny» som en id
      route("/saker/:id",  [reqAuthorization(), SakDetalj]),
      ]),
  ]),
]);

export default { fetch: app.fetch };
