"use client";

import { createCase } from "@/actions/cases";
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
  >("other");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "severe"
  >("low");
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
        description,
        priority,
        deadLine,
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
    <form>
      <textarea></textarea>
    </form>
  );
}
