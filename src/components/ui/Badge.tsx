import React from "react";

export default function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-xs font-medium text-black shadow-sm shadow-black/5 backdrop-blur ${className}`}
    >
      {children}
    </span>
  );
}