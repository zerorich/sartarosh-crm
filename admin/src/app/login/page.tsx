"use client";

import React from "react";
import { Scissors } from "lucide-react";
import { EmailOtpFlow } from "@/features/auth/ui/EmailOtpFlow";

export default function LoginPage() {
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
            Sign in with your admin email address
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-6">
          <EmailOtpFlow />
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
