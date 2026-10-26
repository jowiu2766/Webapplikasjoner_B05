import type { ReactNode } from "react";
import type { Case } from "@/db/schema";
import type { User } from "@/db/schema/auth-schema";
import { categoryLabels, priorityLabels, statusLabels } from "@/lib/enums";
import type { Case, User } from "@/db/schema";
import { categoryLabels, priorityLabels, statusLabels, type UserRole } from "@/lib/enums";

// en sak i lista, tabellrad på desktop og kort på mobil
export function SakRad({
  sak,
  rolle,
  visLeietaker,
}: {
  sak: Case & { tenant: User };
  // midlertidig til innlogging er på plass
  rolle: UserRole;
  visLeietaker: boolean;
}) {
  return (
    <tr className="block rounded-lg border border-slate-200 p-4 md:table-row md:rounded-none md:border-0 md:border-b md:p-0">
      <td className="block font-medium md:table-cell md:py-3 md:pr-4">
        <a className="underline" href={`/saker/${sak.id}?rolle=${rolle}`}>
          {sak.title}
        </a>
      </td>
      <Celle etikett="Kategori">{categoryLabels[sak.category]}</Celle>
      <Celle etikett="Prioritet">{priorityLabels[sak.priority]}</Celle>
      <Celle etikett="Status">{statusLabels[sak.status]}</Celle>
      {visLeietaker && <Celle etikett="Leietaker">{sak.tenant.name}</Celle>}
      <Celle etikett="Opprettet">
        {sak.createdAt.toLocaleDateString("no-NO")}
      </Celle>
    </tr>
  );
}

function Celle({ etikett, children }: { etikett: string; children: ReactNode }) {
  return (
    <td className="block md:table-cell md:py-3 md:pr-4">
      <span className="text-slate-500 md:hidden">{etikett}: </span>
      {children}
    </td>
  );
}
