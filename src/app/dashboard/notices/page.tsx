
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Megaphone } from "lucide-react";
import type { Notice } from "../admin/notices/page";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const storedNotices = localStorage.getItem("platform_notices");
    if (storedNotices) {
      setNotices(JSON.parse(storedNotices));
    }
  }, []);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notices & Events</h1>
        <p className="text-muted-foreground">
          Stay up-to-date with the latest announcements from the platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Official Announcements</CardTitle>
          <CardDescription>
            Important updates and events from the TaskReview Hub team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notices.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {notices.map((notice) => (
                <AccordionItem value={`item-${notice.id}`} key={notice.id}>
                  <AccordionTrigger>
                    <div className="flex flex-col text-left">
                        <span>{notice.title}</span>
                        <span className="text-xs text-muted-foreground font-normal mt-1">{new Date(notice.date).toLocaleDateString()}</span>
                    </div>
                    </AccordionTrigger>
                  <AccordionContent>
                    <p className="whitespace-pre-wrap">{notice.content}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12">
              <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Notices Yet</h3>
              <p className="text-muted-foreground mt-1">
                There are no official announcements at this time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
