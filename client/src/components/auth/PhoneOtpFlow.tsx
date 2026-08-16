"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSendOtp, useVerifyOtp } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error-messages";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("998")) return `+${digits}`;
  return `+998${digits}`;
}

interface PhoneOtpFlowProps {
  heading: string;
  subheading: string;
  askName?: boolean;
}

export function PhoneOtpFlow({ heading, subheading, askName }: PhoneOtpFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
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
    try {
      const result = await sendOtp.mutateAsync(normalizePhone(phone));
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
        phone: normalizePhone(phone),
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
          <Phone className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-bold">{heading}</h1>
        <p className="mt-1 text-sm text-muted">{subheading}</p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
          <label className="text-sm font-medium" htmlFor="phone">
            Telefon raqam
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoFocus
            required
            placeholder="+998 90 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 rounded-xl border border-border bg-transparent px-4 text-sm outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={sendOtp.isPending} fullWidth size="lg">
            SMS-kod olish
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            <span className="font-medium text-foreground">{normalizePhone(phone)}</span> raqamiga yuborilgan
            6 xonali kodni kiriting.
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
            onClick={() => setStep("phone")}
            className="cursor-pointer text-center text-sm text-muted underline underline-offset-4"
          >
            Raqamni o&apos;zgartirish
          </button>
        </form>
      )}
    </div>
  );
}
