const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export type UploadError = {
  kind: "no-file" | "bad-type" | "too-large";
  message: string;
};

// Løs adaptertype, så funksjonen godtar både en ekte R2Bucket og en mock.
export type R2Like = {
  put: (key: string, body: any, opts?: any) => Promise<any>;
  delete: (key: string) => Promise<any>;
};

export async function storeUpload(
  r2: R2Like,
  formData: FormData,
  field: string,
  keyPrefix: string,
  ownerId: string,
): Promise<{ ok: true; key: string } | { ok: false; error: UploadError }> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      error: { kind: "no-file", message: "Ingen fil mottatt" },
    };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: {
        kind: "bad-type",
        message: `Filtype ikke tillatt: ${file.type}`,
      },
    };
  }
  if (file.size > MAX_SIZE) {
    return {
      ok: false,
      error: { kind: "too-large", message: "Filen er for stor (maks 5 MB)" },
    };
  }

  const extension = file.type.split("/")[1];
  // Unik nøkkel: to opplastinger overskriver aldri hverandre (cache-busting).
  const key = `${keyPrefix}/${ownerId}-${Date.now()}.${extension}`;
  await r2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  return { ok: true, key };
}

export { ALLOWED_TYPES, MAX_SIZE };
