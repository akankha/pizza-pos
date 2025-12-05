import React from "react";

interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "outline" | "ghost";
  size?: "small" | "medium" | "large" | "xl";
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function TouchButton({
  children,
  onClick,
  variant = "primary",
  size = "large",
  disabled = false,
  className = "",
  fullWidth = false,
  type = "button",
}: TouchButtonProps) {
  const baseClasses =
    "relative overflow-hidden font-semibold rounded-xl transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none flex items-center justify-center gap-2";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-[#FF6B35] to-[#ff8555] hover:from-[#e85d2a] hover:to-[#FF6B35] text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
    secondary:
      "bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
    success:
      "bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
    outline:
      "bg-white hover:bg-orange-50 border-2 border-[#FF6B35] text-[#FF6B35] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-none hover:-translate-y-0.5 active:translate-y-0",
  };

  const sizeClasses = {
    small: "px-4 py-2.5 text-sm min-h-[44px]",
    medium: "px-5 py-3 text-base min-h-[52px]",
    large: "px-6 py-3.5 text-lg min-h-[56px]",
    xl: "px-8 py-4 text-xl min-h-[64px]",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}
