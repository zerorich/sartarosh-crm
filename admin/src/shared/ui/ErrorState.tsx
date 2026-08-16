import React from "react";
import { AlertOctagon, RotateCw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  message = "An unexpected error occurred while fetching information from the server. Please try again.",
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-10 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/60 my-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-sm">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-md">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          isLoading={isRetrying}
          leftIcon={<RotateCw className="w-4 h-4" />}
          variant="outline"
          size="sm"
          className="mt-5 border-rose-300 text-rose-700 hover:bg-rose-100/60 dark:border-rose-800 dark:text-rose-300"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
