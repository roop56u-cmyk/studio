
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { defaultMessages } from "@/lib/custom-messages";

export default function ManageMessagesPage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<string>(defaultMessages);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedMessages = localStorage.getItem("platform_custom_messages");
        if (storedMessages) {
            setMessages(storedMessages);
        } else {
            setMessages(defaultMessages);
        }
    }, []);

    const saveChanges = () => {
        localStorage.setItem("platform_custom_messages", messages);
        toast({
            title: "Messages Saved!",
            description: "The custom platform messages have been updated.",
        });
    };
    
    const restoreDefaults = () => {
        setMessages(defaultMessages);
         localStorage.setItem("platform_custom_messages", defaultMessages);
        toast({
            title: "Messages Restored!",
            description: "All messages have been restored to their default values.",
        });
    }

    if (!isClient) {
        return (
             <div className="grid gap-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Messages</h1>
                    <p className="text-muted-foreground">
                    Edit platform-wide custom messages and text.
                    </p>
                </div>
            </div>
        )
    }

  return (
    <div className="grid gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Messages</h1>
            <p className="text-muted-foreground">
            Edit platform-wide custom messages and text. Note: This is a simple text editor. Be careful with your changes.
            </p>
        </div>

        <Card>
             <CardHeader>
                <CardTitle>Platform Message Editor</CardTitle>
                <CardDescription>
                    The content below is used for various alerts, popups, and static text across the site. The file uses Markdown for formatting (e.g., `# Title`, `**bold**`).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <Textarea 
                value={messages}
                onChange={(e) => setMessages(e.target.value)}
                rows={25}
                className="font-mono text-xs"
               />
            </CardContent>
            <CardFooter className="flex justify-between">
                 <Button onClick={saveChanges}>Save All Changes</Button>
                 <Button variant="outline" onClick={restoreDefaults}>Restore Defaults</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
