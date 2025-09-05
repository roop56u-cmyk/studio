
"use client";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement> & { className?: string }) {
  const [name, setName] = useState("Taskify");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('website_name');
    if (savedName) setName(savedName);
    
    const savedLogoDataUrl = localStorage.getItem('website_logo_data_url');
    if (savedLogoDataUrl) setLogoDataUrl(savedLogoDataUrl);
  }, []);


  return (
    <div className={cn("flex items-center gap-2 text-foreground", className)}>
      {logoDataUrl ? (
        <Image src={logoDataUrl} alt={name} className="h-8 w-auto" width={100} height={32} unoptimized />
      ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-primary"
            {...props}
            >
            <path d="M4 12.036V19.5a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19.5V12.036" />
            <path d="m4 12 8-8 8 8" />
            <path d="M12 4v17" />
            <path d="m15 12-3-3-3 3" />
        </svg>
      )}
      <span className="text-xl font-bold tracking-tight">{name}</span>
    </div>
  );
}
