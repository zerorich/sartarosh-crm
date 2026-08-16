"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSendOtp, useVerifyOtp } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error-messages";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface EmailOtpFlowProps {
  heading: string;
  subheading: string;
  askName?: boolean;
}

export function EmailOtpFlow({ heading, subheading, askName }: EmailOtpFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError("To'g'ri email manzilini kiriting (masalan, example@gmail.com).");
      return;
    }

    try {
      const result = await sendOtp.mutateAsync(normalized);
      setDebugOtp(result.debugOtp ?? null);
      setStep("otp");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await verifyOtp.mutateAsync({
        email: normalizeEmail(email),
        otp,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      router.replace(redirectTo);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Mail className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-bold">{heading}</h1>
        <p className="mt-1 text-sm text-muted">{subheading}</p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
          <label className="text-sm font-medium" htmlFor="email">
            Gmail / Email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            required
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl border border-border bg-transparent px-4 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={sendOtp.isPending} fullWidth size="lg">
            Email-kod olish
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">{normalizeEmail(email)}</span> manziliga yuborilgan 6
            xonali kodni kiriting.
          </p>
          {debugOtp && (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
              Demo rejim: kod — <span className="font-mono font-semibold">{debugOtp}</span>
            </p>
          )}
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            required
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="h-12 rounded-xl border border-border bg-transparent px-4 text-center text-lg font-semibold tracking-[0.4em] outline-none focus:border-primary"
          />

          {askName && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Ism"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Familiya"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" loading={verifyOtp.isPending} disabled={otp.length !== 6} fullWidth size="lg">
            Tasdiqlash
          </Button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="cursor-pointer text-center text-sm text-muted underline underline-offset-4"
          >
            Emailni o&apos;zgartirish
          </button>
        </form>
      )}
    </div>
  );
}
