"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  selectedValue,
  onChange,
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0];

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-normal">{label}:</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {selectedOption?.label}
          </span>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95">
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                  isSelected
                    ? "text-slate-900 dark:text-white font-semibold bg-slate-50 dark:bg-slate-800/50"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <span>{option.label}</span>
                <div className="flex items-center gap-1.5">
                  {option.count !== undefined && (
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                      {option.count}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
