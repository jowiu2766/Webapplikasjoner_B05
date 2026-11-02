import { z } from "zod";

export const kartverketAdresseSchema = z.object({
  adressetekst: z.string(),
  postnummer: z.string(),
  poststed: z.string(),
  kommunenavn: z.string(),
  representasjonspunkt: z.object({ lat: z.number(), lon: z.number() }).optional(),
});

export const kartverketSvarSchema = z.object({
  adresser: z.array(kartverketAdresseSchema),
});

export const adresseDTOSchema = z.object({
  adressetekst: z.string(),
  postnummer: z.string(),
  poststed: z.string(),
  kommunenavn: z.string(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
});

export type KartverketAdresse = z.infer<typeof kartverketAdresseSchema>;
export type AdresseDTO = z.infer<typeof adresseDTOSchema>;

export function tilAdresseDTO(adresse: KartverketAdresse): AdresseDTO {
  return {
    adressetekst: adresse.adressetekst,
    postnummer: adresse.postnummer,
    poststed: adresse.poststed,
    kommunenavn: adresse.kommunenavn,
    lat: adresse.representasjonspunkt?.lat ?? null,
    lon: adresse.representasjonspunkt?.lon ?? null,
  };
}

export function formaterAdresse(
  adresse: Pick<AdresseDTO, "adressetekst" | "postnummer" | "poststed">,
): string {
  return `${adresse.adressetekst}, ${adresse.postnummer} ${adresse.poststed}`;
}
