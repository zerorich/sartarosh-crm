"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Phone, KeyRound } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  isAdminRole,
  saveSession,
  type AdminUser,
} from "@/shared/lib/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type SendOtpResponse = {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    phone: string;
    expiresInSeconds: number;
    debugOtp?: string;
  };
};

type VerifyOtpResponse = {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    user: AdminUser;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    isNewUser: boolean;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("+998900000001");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      let body: SendOtpResponse;
      try {
        body = (await res.json()) as SendOtpResponse;
      } catch {
        setError("Invalid response from server. Please try again.");
        return;
      }

      if (!res.ok || !body.success) {
        setError(body.message || "Failed to send verification code.");
        return;
      }

      setDebugOtp(body.data?.debugOtp ?? null);
      setOtp("");
      setStep("otp");
    } catch {
      setError(
        "Unable to reach the server. Check that the backend is running at " +
          API_BASE
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
      });

      let body: VerifyOtpResponse;
      try {
        body = (await res.json()) as VerifyOtpResponse;
      } catch {
        setError("Invalid response from server. Please try again.");
        return;
      }

      if (!body.success) {
        setError(body.message || body.code || "Verification failed.");
        return;
      }

      const { user, tokens } = body.data!;

      if (!isAdminRole(user.role)) {
        setError("Access denied — admin account required");
        return;
      }

      saveSession(tokens.accessToken, tokens.refreshToken, user);
      router.push("/admin");
    } catch {
      setError(
        "Unable to reach the server. Check that the backend is running at " +
          API_BASE
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangePhone = () => {
    setStep("phone");
    setOtp("");
    setDebugOtp(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 antialiased">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl -ml-20 -mb-20" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg mb-4">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            CutZone Admin
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Sign in with your admin phone number
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-6">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <Input
                label="Phone number"
                type="tel"
                placeholder="+998900000001"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                helperText="E.164 format, e.g. +998900000001"
                autoComplete="tel"
                required
              />

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSending}
                disabled={!phone.trim()}
              >
                Send code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Code sent to{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {phone}
                  </span>
                </p>
                {debugOtp && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Dev OTP: {debugOtp}
                  </p>
                )}
              </div>

              <Input
                label="Verification code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                leftIcon={<KeyRound className="w-4 h-4" />}
                autoComplete="one-time-code"
                required
              />

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isVerifying}
                disabled={otp.length !== 6}
              >
                Verify & sign in
              </Button>

              <button
                type="button"
                onClick={handleChangePhone}
                className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Change phone number
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
