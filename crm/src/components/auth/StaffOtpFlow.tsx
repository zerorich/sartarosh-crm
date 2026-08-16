"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSendOtp, useVerifyOtp } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error-messages";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/user";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("998")) return `+${digits}`;
  return `+998${digits}`;
}

export function StaffOtpFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [role, setRole] = useState<Role>("BARBER");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const result = await sendOtp.mutateAsync({ phone: normalizePhone(phone), role });
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
      await verifyOtp.mutateAsync({ phone: normalizePhone(phone), otp, role });
      router.replace("/");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Image src="/logo-header.png" alt="CutZone" width={139} height={60} className="h-10 w-auto" priority />
        <div>
          <h1 className="text-lg font-bold">CRM panelga kirish</h1>
          <p className="mt-1 text-sm text-muted">Sartarosh yoki salon egasi sifatida kiring</p>
        </div>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
          <div className="flex gap-2 rounded-xl bg-surface-muted p-1">
            {(["BARBER", "OWNER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors",
                  role === r && "bg-surface shadow-sm",
                )}
              >
                {r === "BARBER" ? "Sartarosh" : "Salon egasi"}
              </button>
            ))}
          </div>

          <label className="text-sm font-medium" htmlFor="phone">
            Telefon raqam
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoFocus
              required
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-transparent pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>
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
