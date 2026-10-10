"use client";

import { createCase } from "@/actions/cases";
import { Placeholder } from "drizzle-orm";
import { useState, useTransition } from "react";

// måten jeg har satt opp date må nok endres
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const caseCreated = new Date(Date.now());

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
  const [deadLine, setDeadLine] = useState(addDays(caseCreated, 7)); // Automatisk 7 dagers deadline fra sak blir sendt inn - må teste denne
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
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setCategory("other");
      setDescription("");
      setPriority("low");
      setDeadLine(addDays(new Date(), 7));
    });
  }

  // Mer skal føres inn her
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
      <input type="date" id="deadLine"></input>
      {/* Submit button */}
      <div>
        <button type="submit" disabled={isPending}>
          {isPending ? "Sender..." : "Send"}
        </button>
      </div>
    </form>
  );
}
