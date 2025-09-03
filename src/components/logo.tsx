
"use client";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export function Logo({ className, ...props }: SVGProps<SVGSVGElement> & { className?: string }) {
  const [name, setName] = useState("TaskReview Hub");
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
        <Image src={logoDataUrl} alt={name} className="h-8 w-auto" width={100} height={32} />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-primary"
          {...props}
        >
          <path d="M15 3h6v6" />
          <path d="M9 21H3v-6" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
        </svg>
      )}
      <span className="text-xl font-bold tracking-tight">{name}</span>
    </div>
  );
}
