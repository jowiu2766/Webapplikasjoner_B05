import { defineApp } from "rwsdk/worker";
import { layout, render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/Home";
import { AppLayout } from "./app/layouts/AppLayout";
import { TestStateSceeen } from "@/app/pages/Screens/TestStateScreen";
import { headers } from "happy-dom/lib/PropertySymbol";
import { SafeUser } from "./db/schema";
import { AuthContext } from "./types/authorisation";
import { setupDb, type DB } from "@/db";

import { NewCase } from "./app/pages/NewCase";
import { SakerList } from "@/app/pages/saker/List";

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

export interface Env{ DB: D1Database; }

export type AppContext = {
  db: DB;
} & AuthContext;


const app = defineApp([
  // Middleware. Kjører for hver forespørsel, i rekkefølgen de står.
  setCommonHeaders(),

  // API-rute. Ligger UTENFOR render(), så svaret er akkurat det handleren
  // returnerer: JSON, uten HTML-skall rundt.
  route("/api/status", () => Response.json({ status: "ok", version: "0.1.0" })),

  // Sider. render(Document, [...]) pakker dem i et helt HTML-dokument.
  render(Document,[
      layout(AppLayout, [
        route("/", Home),
        route("/Screens", TestStateSceeen),
      ])
    ])
  ]);
  render(Document, [
    route("/", Home),
    route("/saker", SakerList),
    route("/saker/ny", NewCase),
  ]),
]);

export default { fetch: app.fetch };
