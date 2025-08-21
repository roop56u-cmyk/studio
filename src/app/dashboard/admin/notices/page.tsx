
"use client";

import { useState } from "react";
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

export default function AdminNoticesPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
    // In a real app, this would be saved to a database.
    // For now, we'll just show a success toast and clear the form.
    toast({
      title: "Notice Published!",
      description: `The notice "${title}" has been posted for all users.`,
    });
    setTitle("");
    setContent("");
  };

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Notices</h1>
        <p className="text-muted-foreground">
          Create, edit, and publish notices for all users.
        </p>
      </div>
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
    </div>
  );
}
