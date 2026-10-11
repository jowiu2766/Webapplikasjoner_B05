"use client";

import { createCase } from "@/actions/cases";
import { Placeholder } from "drizzle-orm";
import { useState, useTransition } from "react";

// Setter deadline automatisk 7 dager fra sak sendes inn hvis deadline ikke blir satt av bruker
function defaultDeadline() {
  const now = new Date();
  now.setDate(now.getDate() + 7);
  return now;
}

export function NewCaseForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<
    | "electricity"
    | "pipes"
    | "pests"
    | "water damage"
    | "maintenance issue"
    | "complaint"
    | "other"
    | "choose"
  >("choose");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "severe" | "choose"
  >("choose");
  const [description, setDescription] = useState("");
  const [deadLine, setDeadLine] = useState(defaultDeadline());
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCase(
        title,
        category,
        priority,
        description,
        deadLine.toISOString(),
        files,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setCategory("other");
      setDescription("");
      setPriority("low");
      setDeadLine(defaultDeadline);
      setFiles([]);
    });
    console.log(title, category, priority, description, deadLine, files);
  }

  return (
    <form onSubmit={onSubmit}>
      {/* Title */}
      <textarea
        value={title}
        id="title"
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Kort forklaring av sak"
      />
      {/* Category */}
      <label htmlFor="category">Kategori</label>
      <select
        id="category"
        name="category"
        value={category}
        onChange={(e) => setCategory(e.target.value as typeof category)}
      >
        <option value="choose">Velg</option>
        <option value="electricity">Elektrisitet</option>
        <option value="pipes">Rør</option>
        <option value="pests">Skadedyr</option>
        <option value="water damage">Vannskade</option>
        <option value="maintenance issue">Vedlikehold</option>
        <option value="complaint">Klage</option>
        <option value="other">Annet</option>
      </select>
      {/* Priority */}
      <label htmlFor="priority">Prioritet</label>
      <select
        id="priority"
        name="priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value as typeof priority)}
      >
        <option value="choose">Velg</option>
        <option value="low">Lav</option>
        <option value="medium">Medium</option>
        <option value="high">Høy</option>
        <option value="severe">Kritisk</option>
      </select>
      {/* Decription */}
      <textarea
        value={description}
        id="description"
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Forklar detaljert hva saken gjelder"
      />
      {/* Deadline */}
      <label htmlFor="deadLine">Tidsfrist</label>
      <input
        type="date"
        name="deadLine"
        id="deadLine"
        onChange={(e) => setDeadLine(new Date(e.target.value))}
      />
      {/* Files - mulig å laste opp flere filer samtidig, men man må markere dem samtidig når de skal lastes opp. 
      Hvis ikke erstatter de filene som er lagt til allerede */}
      <label htmlFor="files">Filer</label>
      <input
        type="file"
        id="files"
        name="files"
        multiple
        onChange={(e) => {
          setFiles(Array.from(e.target.files ?? []));
        }}
      />
      {/* Submit button */}
      <div>
        <button type="submit" disabled={isPending}>
          {isPending ? "Sender..." : "Send"}
        </button>
      </div>
    </form>
  );
}
