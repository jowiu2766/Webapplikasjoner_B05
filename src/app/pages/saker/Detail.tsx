import type { ReactNode } from "react";
import type { RequestInfo } from "rwsdk/worker";
import { midlertidigBruker } from "@/db/queries/bruker";
import { hentSak } from "@/db/queries/saker";
import { categoryLabels, priorityLabels, statusLabels } from "@/lib/enums";
import { harTilgang, kanAvbryteSak, lovligeOverganger } from "@/lib/sak-status";
import { AvbrytSakKnapp } from "@/components/AvbrytSakKnapp";
import { EmptyState } from "@/components/EmptyState";
import { MeldingForm } from "@/components/MeldingForm";
import { StatusVelger } from "@/components/StatusVelger";

export async function SakDetalj({ params, request, response }: RequestInfo<{ id: string }>) {
  const bruker = await midlertidigBruker(request);
  if (!bruker) {
    return (
      <Side>
        <EmptyState title="Fant ingen bruker">Kjør npm run seed først.</EmptyState>
      </Side>
    );
  }

  const sak = await hentSak(params.id);
  if (!sak) {
    response.status = 404;
    return (
      <Side>
        <EmptyState title="Fant ikke saken">Den finnes ikke, eller er slettet.</EmptyState>
      </Side>
    );
  }

  if (!harTilgang(bruker, sak)) {
    response.status = 403;
    return (
      <Side>
        <EmptyState title="Ingen tilgang">Du er ikke part i denne saken.</EmptyState>
      </Side>
    );
  }

  const erUtleier = bruker.role === "Landlord";
  const tilbake = `/saker?rolle=${bruker.role}`;

  return (
    <Side>
      <a className="text-sm underline" href={tilbake}>
        Tilbake til sakene
      </a>

      <h1 className="mt-4 text-3xl font-bold">{sak.title}</h1>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <Merke>{categoryLabels[sak.category]}</Merke>
        <Merke>{priorityLabels[sak.priority]}</Merke>
        <Merke>{statusLabels[sak.status]}</Merke>
      </div>

      <p className="mt-4 whitespace-pre-line">{sak.description}</p>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-slate-600">
        <dt>Leietaker</dt>
        <dd>{sak.tenant.name}</dd>
        <dt>Utleier</dt>
        <dd>{sak.landlord.name}</dd>
        <dt>Opprettet</dt>
        <dd>{sak.createdAt.toLocaleDateString("no-NO")}</dd>
      </dl>

      {erUtleier ? (
        <StatusVelger sakId={sak.id} valg={lovligeOverganger(sak.status, bruker.role)} />
      ) : (
        kanAvbryteSak(sak.status, bruker.role) && <AvbrytSakKnapp sakId={sak.id} />
      )}

      <h2 className="mt-10 text-xl font-semibold">Meldinger</h2>

      {sak.messages.length === 0 ? (
        <EmptyState title="Ingen meldinger ennå" />
      ) : (
        <ul className="mt-4 space-y-3">
          {sak.messages.map((melding) => {
            const egen = melding.senderId === bruker.id;
            return (
              <li
                key={melding.id}
                className={`max-w-prose rounded-lg border p-3 ${
                  egen ? "ml-auto border-slate-900 bg-slate-50" : "border-slate-200"
                }`}
              >
                <p className="text-xs text-slate-500">
                  {egen ? "Deg" : melding.sender.name},{" "}
                  {melding.createdAt.toLocaleString("no-NO", { timeZone: "Europe/Oslo" })}
                </p>
                <p className="mt-1 whitespace-pre-line">{melding.body}</p>
              </li>
            );
          })}
        </ul>
      )}

      <MeldingForm sakId={sak.id} />
    </Side>
  );
}

function Side({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-4xl p-8 font-sans">{children}</main>;
}

function Merke({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1">{children}</span>;
}
