
"use client";

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

// Mock data for demonstration
const notices = [
  {
    id: 1,
    title: "Scheduled Maintenance on August 15th",
    date: "2024-08-01",
    content: "Please be advised that we will be undergoing scheduled maintenance on August 15th from 2:00 AM to 4:00 AM UTC. The platform may be temporarily unavailable during this time. We apologize for any inconvenience.",
  },
  {
    id: 2,
    title: "New Referral Bonus System Launched!",
    date: "2024-07-28",
    content: "We are excited to announce our new and improved referral bonus system! For every new user you refer who makes a qualifying first deposit, you will now receive a $5 bonus directly to your main wallet. Check the 'Team' page for your referral code.",
  },
    {
    id: 3,
    title: "Update to Withdrawal Fees",
    date: "2024-07-25",
    content: "As of August 1st, we will be adjusting our withdrawal fee structure. Level 1 will have a 5% fee, Level 2 will have a 3% fee, and Levels 3 and above will have a 1% fee. This change allows us to continue providing a secure and efficient platform.",
  },
];

export default function NoticesPage() {
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
                        <span className="text-xs text-muted-foreground font-normal mt-1">{notice.date}</span>
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
