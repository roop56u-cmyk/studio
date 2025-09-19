
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
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
import { Trash2, Pin, PinOff, Upload, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export type Notice = {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string | null;
};

export default function AdminNoticesPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isPopupEnabled, setIsPopupEnabled] = useState(false);
  const [popupNoticeId, setPopupNoticeId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedNotices = localStorage.getItem("platform_notices");
    if (storedNotices) {
      setNotices(JSON.parse(storedNotices));
    }
    const storedPopupEnabled = localStorage.getItem("login_popup_enabled");
    if (storedPopupEnabled) {
      setIsPopupEnabled(JSON.parse(storedPopupEnabled));
    }
    const storedPopupNoticeId = localStorage.getItem("login_popup_notice_id");
    if (storedPopupNoticeId) {
      setPopupNoticeId(storedPopupNoticeId);
    }
  }, []);

  const persistNotices = (newNotices: Notice[]) => {
    setNotices(newNotices);
    localStorage.setItem("platform_notices", JSON.stringify(newNotices));
  };
  
  useEffect(() => {
    if(isClient) {
        localStorage.setItem("login_popup_enabled", JSON.stringify(isPopupEnabled));
    }
  }, [isPopupEnabled, isClient]);
  
  useEffect(() => {
    if (isClient) {
        if (popupNoticeId) {
          localStorage.setItem("login_popup_notice_id", popupNoticeId);
        } else {
          localStorage.removeItem("login_popup_notice_id");
        }
    }
  }, [popupNoticeId, isClient]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      imageUrl: image,
    };

    const newNotices = [newNotice, ...notices];
    persistNotices(newNotices);

    toast({
      title: "Notice Published!",
      description: `The notice "${title}" has been posted for all users.`,
    });
    setTitle("");
    setContent("");
    setImage(null);
  };

  const handleDelete = (id: string) => {
    if (id === popupNoticeId) {
        setPopupNoticeId(null);
    }
    const newNotices = notices.filter(n => n.id !== id);
    persistNotices(newNotices);
    toast({
        title: "Notice Deleted",
        variant: "destructive",
    });
  }

  const handleSetPopupNotice = (id: string) => {
    if (popupNoticeId === id) {
      setPopupNoticeId(null); // Unset if already set
      toast({ title: "Login Popup Notice Unset" });
    } else {
      setPopupNoticeId(id);
      toast({ title: "Login Popup Notice Set" });
    }
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Notices</h1>
        <p className="text-muted-foreground">
          Create, edit, and publish notices for all users.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Login Popup Notice</CardTitle>
          <CardDescription>
            Enable this to show a notice to users immediately after they log in. Select a notice below to be the popup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch id="enable-popup" checked={isPopupEnabled} onCheckedChange={setIsPopupEnabled} />
            <Label htmlFor="enable-popup">Enable Login Popup Notice</Label>
          </div>
        </CardContent>
      </Card>

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
                    rows={4}
                />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notice-image">Image / GIF (Optional)</Label>
                    <Input id="notice-image" type="file" accept="image/*,image/gif" onChange={handleFileChange} />
                    {image && (
                        <div className="relative mt-2 w-32 h-32">
                             <Image src={image} alt="Notice preview" layout="fill" className="object-cover rounded-md" />
                             <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImage(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
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
                            {popupNoticeId === notice.id && <Badge variant="secondary" className="ml-auto mr-2">Login Popup</Badge>}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            {notice.imageUrl && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                <Image src={notice.imageUrl} alt={notice.title} layout="fill" className="object-cover" unoptimized/>
                                </div>
                            )}
                            <p className="whitespace-pre-wrap">{notice.content}</p>
                            <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" onClick={() => handleSetPopupNotice(notice.id)}>
                                    {popupNoticeId === notice.id ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                                    {popupNoticeId === notice.id ? 'Unset as Popup' : 'Set as Popup'}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(notice.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </div>
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
