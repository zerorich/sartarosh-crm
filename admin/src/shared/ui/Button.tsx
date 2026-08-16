import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-slate-900 text-white hover:bg-slate-800 shadow-sm focus:ring-slate-950 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200/80 focus:ring-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus:ring-rose-500",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm focus:ring-emerald-500",
      outline:
        "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 focus:ring-slate-200 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-200 dark:text-slate-200 dark:hover:bg-slate-800",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "p-2 shrink-0 aspect-square",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
