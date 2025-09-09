
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AboutUsData } from "@/app/dashboard/admin/about-us/page";

export function AboutUsPanel() {
  const [data, setData] = useState<AboutUsData | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("about_us_data");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">About Us information is not available.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-6 pr-6">
        {data.logo && (
          <div className="flex justify-center">
            <Image src={data.logo} alt="Company Logo" width={150} height={75} className="object-contain" unoptimized />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-center">{data.title}</h1>
        {data.mainImage && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image src={data.mainImage} alt="About Us" layout="fill" className="object-cover" unoptimized />
            </div>
        )}
        <p className="text-base text-muted-foreground whitespace-pre-wrap">{data.description}</p>
      </div>
    </ScrollArea>
  );
}
