"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChange, placeholder = "Sartaroshxona yoki manzil qidirish...", className, autoFocus }: SearchBarProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="pointer-events-none absolute left-3.5 size-4 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Qidirish"
        className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-9 text-sm outline-none focus:border-primary"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Tozalash"
          className="absolute right-3 flex size-5 cursor-pointer items-center justify-center rounded-full text-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
