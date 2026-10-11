"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login } from "@/app/api/auth/authServerActions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Logger inn..." : "Logg inn"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await login(prevState, formData); 

      if (result.success) {
        window.location.href = "/";
      }
      return result;
    },
    {
      success: false,
      error: "",
      state: {
        user: null,
        session: null,
      },
    }
  );

  return (