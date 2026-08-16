"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound } from "lucide-react";
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
    email: string;
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

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EmailOtpFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("admin@cutzone.uz");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError("Enter a valid email address (e.g. admin@cutzone.uz).");
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
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
        body: JSON.stringify({
          email: normalizeEmail(email),
          otp: otp.trim(),
        }),
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

  const handleChangeEmail = () => {
    setStep("email");
    setOtp("");
    setDebugOtp(null);
    setError(null);
  };

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="admin@cutzone.uz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          helperText="Use your registered Gmail or work email"
          autoComplete="email"
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
          disabled={!email.trim()}
        >
          Send code
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Code sent to{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {normalizeEmail(email)}
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
        onClick={handleChangeEmail}
        className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
      >
        Change email address
      </button>
    </form>
  );
}
