
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";

export type Notice = {
  id: string;
  title: string;
  content: string;
  date: string;
};

export default function AdminNoticesPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const storedNotices = localStorage.getItem("platform_notices");
    if (storedNotices) {
      setNotices(JSON.parse(storedNotices));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("platform_notices", JSON.stringify(notices));
  }, [notices]);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill out both the title and content for the notice.",
      });
      return;
    }
    
    const newNotice: Notice = {
      id: `NOTICE-${Date.now()}`,
      title,
      content,
      date: new Date().toISOString().split('T')[0],
    };

    setNotices(prev => [newNotice, ...prev]);

    toast({
      title: "Notice Published!",
      description: `The notice "${title}" has been posted for all users.`,
    });
    setTitle("");
    setContent("");
  };

  const handleDelete = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    toast({
        title: "Notice Deleted",
        variant: "destructive",
    });
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Notices</h1>
        <p className="text-muted-foreground">
          Create, edit, and publish notices for all users.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handlePublish}>
            <Card>
            <CardHeader>
                <CardTitle>Create a New Notice</CardTitle>
                <CardDescription>
                This notice will be visible to all users on their dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="notice-title">Notice Title</Label>
                <Input
                    id="notice-title"
                    placeholder="e.g., Scheduled Maintenance"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="notice-content">Content</Label>
                <Textarea
                    id="notice-content"
                    placeholder="Write the full details of the notice here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={6}
                />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit">Publish Notice</Button>
            </CardFooter>
            </Card>
        </form>
         <Card>
            <CardHeader>
                <CardTitle>Published Notices</CardTitle>
                <CardDescription>Currently visible announcements.</CardDescription>
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
                            <Button size="sm" variant="destructive" className="mt-4" onClick={() => handleDelete(notice.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No notices have been published.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
