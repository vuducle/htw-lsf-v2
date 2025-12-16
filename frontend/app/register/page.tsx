"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { z } from "zod";
import { useToastify } from "@/hooks/useToastify";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z
  .object({
    firstName: z.string().min(1, "Vorname ist erforderlich"),
    lastName: z.string().min(1, "Nachname ist erforderlich"),
    email: z.string().email("Bitte gültige E-Mail eingeben"),
    password: z.string().min(6, "Mind. 6 Zeichen"),
    confirmPassword: z.string().min(6, "Mind. 6 Zeichen"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein",
  });

type FormState = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToastify();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormState;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      toast.success("Registrierung erfolgreich! Du wirst weitergeleitet…");
      router.push("/");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Registrierung fehlgeschlagen";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="p-6 space-y-6 border rounded-lg bg-background shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Registrieren</h1>
            <p className="text-sm text-muted-foreground">
              Erstelle ein neues Konto.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  placeholder="Max"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  placeholder="Mustermann"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="max@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={onChange}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Wird gesendet…" : "Konto erstellen"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
