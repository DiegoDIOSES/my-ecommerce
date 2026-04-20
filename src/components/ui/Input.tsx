"use client";

import React from "react";

export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm outline-none transition placeholder:text-black/40 focus:border-black/20 focus:ring-4 focus:ring-black/5 ${className}`}
      {...props}
    />
  );
}