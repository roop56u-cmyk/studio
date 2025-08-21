
"use client";

import { useState } from "react";
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
import { useInbox } from "@/contexts/InboxContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function InboxPage() {
  const { messages, sendMessage, isLoading } = useInbox();
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

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
            {messages.map((msg) => {
                 const isCurrentUser = msg.sender === currentUser?.email;
                 const senderName = isCurrentUser ? "You" : msg.sender === "admin@stakinghub.com" ? "Support Team" : msg.sender;
                 const fallback = senderName.charAt(0);

                 return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                        {!isCurrentUser && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/40x40.png?text=${fallback}`} alt={senderName} />
                                <AvatarFallback>{fallback}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`rounded-lg p-3 max-w-[70%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="text-sm font-semibold">{senderName}</p>
                            <p className="text-sm mt-1">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(msg.date).toLocaleString()}</p>
                        </div>
                        {isCurrentUser && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/40x40.png?text=${fallback}`} alt={senderName} />
                                <AvatarFallback>{fallback}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                )
            })}
        </CardContent>
        <div className="p-4 border-t">
            <div className="flex items-center gap-2">
                <Input 
                    placeholder="Type your message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Send"}
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
