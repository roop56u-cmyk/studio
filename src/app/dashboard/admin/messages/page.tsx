
"use client";

import { useState, useEffect } from "react";
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
import { platformMessages } from "@/lib/platform-messages";
import type { MessageCategory } from "@/lib/platform-messages";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ManageMessagesPage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<{[key:string]: {[key:string]: string}}>({});
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedMessages = localStorage.getItem("platform_custom_messages");
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            // Initialize with default values if nothing is stored
            const defaults: {[key:string]: {[key:string]: string}} = {};
            Object.entries(platformMessages).forEach(([catKey, category]) => {
                defaults[catKey] = {};
                Object.entries(category.messages).forEach(([msgKey, msgItem]) => {
                    defaults[catKey][msgKey] = msgItem.defaultValue;
                });
            });
            setMessages(defaults);
        }
    }, []);

    const handleMessageChange = (categoryKey: string, messageKey: string, value: string) => {
        setMessages(prev => ({
            ...prev,
            [categoryKey]: {
                ...prev[categoryKey],
                [messageKey]: value
            }
        }));
    };

    const saveChanges = () => {
        localStorage.setItem("platform_custom_messages", JSON.stringify(messages));
        toast({
            title: "Messages Saved!",
            description: "The custom platform messages have been updated.",
        });
    };
    
    const restoreDefaults = () => {
        const defaults: {[key:string]: {[key:string]: string}} = {};
        Object.entries(platformMessages).forEach(([catKey, category]) => {
            defaults[catKey] = {};
            Object.entries(category.messages).forEach(([msgKey, msgItem]) => {
                defaults[catKey][msgKey] = msgItem.defaultValue;
            });
        });
        setMessages(defaults);
        localStorage.setItem("platform_custom_messages", JSON.stringify(defaults));
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
            Edit platform-wide custom messages and text used in alerts and dialogs.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Platform Message Editor</CardTitle>
                <CardDescription>
                    Modify the text content for various alerts and notifications across the site.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Accordion type="multiple" className="w-full space-y-4">
                    {Object.entries(platformMessages).map(([catKey, category]) => (
                        <AccordionItem value={catKey} key={catKey} className="border rounded-md p-4">
                            <AccordionTrigger>
                                <div className="text-left">
                                    <h3 className="font-semibold">{category.title}</h3>
                                    <p className="text-sm text-muted-foreground font-normal">{category.description}</p>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                {Object.entries(category.messages).map(([msgKey, msgItem]) => (
                                    <div key={msgKey} className="space-y-2">
                                        <Label htmlFor={`${catKey}-${msgKey}`}>{msgItem.label}</Label>
                                        <p className="text-xs text-muted-foreground">{msgItem.description}</p>
                                        <Textarea 
                                            id={`${catKey}-${msgKey}`}
                                            value={messages[catKey]?.[msgKey] ?? msgItem.defaultValue}
                                            onChange={(e) => handleMessageChange(catKey, msgKey, e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
            <CardFooter className="flex justify-between">
                 <Button onClick={saveChanges}>Save All Changes</Button>
                 <Button variant="outline" onClick={restoreDefaults}>Restore Defaults</Button>
            </CardFooter>
        </Card>
    </div>
  );
}
