
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data for demonstration
const messages = [
  {
    id: 1,
    sender: "Support Team",
    avatar: "https://placehold.co/40x40.png",
    content: "Welcome to TaskReview Hub! Let us know if you have any questions.",
    date: "2024-08-01",
  },
  {
    id: 2,
    sender: "You",
    avatar: "https://placehold.co/40x40.png",
    content: "Thanks for the welcome!",
    date: "2024-08-01",
    isCurrentUser: true,
  },
   {
    id: 3,
    sender: "Support Team",
    avatar: "https://placehold.co/40x40.png",
    content: "Your recent withdrawal request has been approved. You should see the funds in your wallet shortly.",
    date: "2024-08-02",
  },
];

export default function InboxPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          View messages and communicate with support.
        </p>
      </div>
      <Card className="flex flex-col h-[60vh]">
        <CardHeader>
          <CardTitle>Conversation with Support</CardTitle>
          <CardDescription>
            This is the beginning of your message history.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.isCurrentUser ? 'justify-end' : ''}`}>
                    {!msg.isCurrentUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.avatar} alt={msg.sender} />
                            <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`rounded-lg p-3 max-w-[70%] ${msg.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.date}</p>
                    </div>
                     {msg.isCurrentUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.avatar} alt={msg.sender} />
                            <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))}
        </CardContent>
        <div className="p-4 border-t">
            <div className="flex items-center gap-2">
                <Input placeholder="Type your message..." />
                <Button>Send</Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
