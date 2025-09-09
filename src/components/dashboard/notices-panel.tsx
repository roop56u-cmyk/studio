
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
import type { Notice } from "@/app/dashboard/admin/notices/page";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NoticesPanel() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [websiteName, setWebsiteName] = useState('Taskify');

  useEffect(() => {
    const storedNotices = localStorage.getItem("platform_notices");
    if (storedNotices) {
      setNotices(JSON.parse(storedNotices));
    }
    const savedName = localStorage.getItem('website_name');
    if(savedName) setWebsiteName(savedName);
  }, []);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="grid gap-8 pr-6">
            <Card className="shadow-none border-0">
                <CardHeader>
                <CardTitle>Official Announcements</CardTitle>
                <CardDescription>
                    Important updates and events from the {websiteName} team.
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
    </ScrollArea>
  );
}
