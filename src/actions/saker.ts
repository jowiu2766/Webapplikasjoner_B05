"use server";

import { requestInfo } from "rwsdk/worker";
import { z } from "zod";
import { midlertidigBruker } from "@/db/queries/bruker";
import { hentSak, leggTilMelding, settStatus } from "@/db/queries/saker";
import { caseStatuses } from "@/lib/enums";
import { harTilgang, kanEndreStatus, kanAvbryteSak } from "@/lib/sak-status";

const meldingSchema = z.object({
  sakId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "Meldingen kan ikke være tom")
    .max(2000, "Meldingen kan ha maks 2000 tegn"),
});

const statusSchema = z.object({
  sakId: z.string().min(1),
  status: z.enum(caseStatuses),
});

type Resultat = { ok: true } | { ok: false; error: string };

async function finnBrukerOgSak(sakId: string) {
  const bruker = requestInfo.ctx.user;
  const sak = await hentSak(sakId);
  if (!bruker || !sak || !harTilgang(bruker, sak)) return undefined;
  return { bruker, sak };
}

export async function sendMelding(
  sakId: string,
  body: string,
): Promise<Resultat> {
  const parsed = meldingSchema.safeParse({ sakId, body });
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const funnet = await finnBrukerOgSak(parsed.data.sakId);
  if (!funnet) return { ok: false, error: "Ingen tilgang til saken" };

  await leggTilMelding({
    caseId: funnet.sak.id,
    senderId: funnet.bruker.id,
    body: parsed.data.body,
  });
  return { ok: true };
}

export async function oppdaterStatus(
  sakId: string,
  status: string,
): Promise<Resultat> {
  const parsed = statusSchema.safeParse({ sakId, status });
  if (!parsed.success) return { ok: false, error: "Ugyldig status" };

  const funnet = await finnBrukerOgSak(parsed.data.sakId);
  if (!funnet) return { ok: false, error: "Ingen tilgang til saken" };

  const { bruker, sak } = funnet;
  if (!kanEndreStatus(sak.status, parsed.data.status, bruker.role)) {
    return { ok: false, error: "Den overgangen er ikke lov" };
  }

  await settStatus(sak.id, parsed.data.status);
  return { ok: true };
}

export async function avbrytSak(sakId: string): Promise<Resultat> {
  const funnet = await finnBrukerOgSak(sakId);
  if (!funnet) return { ok: false, error: "Ingen tilgang til saken" };

  const { bruker, sak } = funnet;
  if (!kanAvbryteSak(sak.status, bruker.role)) {
    return { ok: false, error: "Bare en åpen sak kan avbrytes" };
  }

  await settStatus(sak.id, "closed");
  return { ok: true };
}
