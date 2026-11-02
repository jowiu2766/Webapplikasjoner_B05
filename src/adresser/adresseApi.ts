import { ResultHandler } from "@/lib/utils/result";
import { Errors } from "@/types/errors";
import type { Result } from "@/types/result";
import {
  kartverketSvarSchema,
  tilAdresseDTO,
  type AdresseDTO,
} from "./adresseSchema";

export const KARTVERKET_SOK_URL = "https://api.kartverket.no/adresser/v1/sok";

const FELTER = [
  "adresser.adressetekst",
  "adresser.postnummer",
  "adresser.poststed",
  "adresser.kommunenavn",
  "adresser.representasjonspunkt",
].join(",");

export type FetchFn = typeof fetch;

export function lagSokUrl(sok: string, treffPerSide = 5): URL {
  const url = new URL(KARTVERKET_SOK_URL);
  url.searchParams.set("sok", sok.endsWith("*") ? sok : `${sok}*`);
  url.searchParams.set("treffPerSide", String(treffPerSide));
  url.searchParams.set("filtrer", FELTER);
  return url;
}

export async function sokAdresser(
  sok: string,
  fetchFn: FetchFn = fetch,
): Promise<Result<AdresseDTO[]>> {
  try {
    const response = await fetchFn(lagSokUrl(sok), {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return ResultHandler.failure(
        `Kartverket svarte ${response.status}`,
        Errors.INTERNAL_SERVER_ERROR,
      );
    }
    const svar = kartverketSvarSchema.safeParse(await response.json());
    if (!svar.success) {
      return ResultHandler.failure(
        "Uventet svar fra Kartverket",
        Errors.INTERNAL_SERVER_ERROR,
      );
    }
    return ResultHandler.success(svar.data.adresser.map(tilAdresseDTO));
  } catch (error) {
    return ResultHandler.failure(error, Errors.INTERNAL_SERVER_ERROR);
  }
}
