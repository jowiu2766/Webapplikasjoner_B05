"use client";
import { cases } from "@/db/schema";
import { useState, useTransition } from "react";
import z from "zod";

const uploadErrorSchema = z.object({ error: z.string() });

// Tar utgangspunkt i at man kun kan laste opp filer ved innsending av skjema
export function FileUpload() {
  const [preview, setPreview] = useState<string | null>();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Lokal preview før opplasting til serveren
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await fetch(`/api/saker/${cases.id}/fil`, {
        method: "POST",
        body: data, // fetch setter Content-Type automatisk
      });

      if (!res.ok) {
        const parsed = uploadErrorSchema.safeParse(
          await res.json().catch(() => null),
        );
        setError(parsed.success ? parsed.data.error : "Upload failed");
      }
    });
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-3">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="h-24 w-24 rounded-full object-cover"
        />
      )}
      <input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Laster opp..." : "Last opp"}
      </button>
    </form>
  );
}
