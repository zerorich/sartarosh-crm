import { AlertTriangle } from "lucide-react";
import { getErrorMessage } from "@/lib/error-messages";
import { Button } from "./Button";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = "Xatolik yuz berdi" }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-sm text-muted">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          Qayta urinish
        </Button>
      )}
    </div>
  );
}
