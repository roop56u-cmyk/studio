
"use client";

import { useState, useMemo, useRef } from "react";
import Image from 'next/image';
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
import { Loader2, ArrowLeft, Paperclip, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function InboxPanel() {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    conversations, 
    adminSendMessage 
  } = useInbox();
  const { currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() && !attachment) return;

    if (currentUser?.isAdmin) {
        if (!selectedConversation) return;
        adminSendMessage(selectedConversation, newMessage, attachment);
    } else {
        sendMessage(newMessage, attachment);
    }
    
    setNewMessage("");
    setAttachment(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentMessages = useMemo(() => {
    if (currentUser?.isAdmin) {
        if (!selectedConversation) return [];
        return messages.filter(m => m.sender === selectedConversation || m.recipient === selectedConversation);
    }
    return messages;
  }, [messages, currentUser, selectedConversation]);

  if (!currentUser) return null;

  if (currentUser.isAdmin) {
    return (
        <div className="grid gap-8">
            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 h-[calc(100vh-12rem)]">
                <Card>
                    <CardHeader className="p-2">
                        <CardTitle className="text-base">Conversations</CardTitle>
                    </CardHeader>
                    <ScrollArea className="h-[calc(100vh-16rem)]">
                        <CardContent className="p-2">
                             {conversations.map(convo => (
                                <div 
                                    key={convo.email} 
                                    className={cn(
                                        "p-2 rounded-md cursor-pointer hover:bg-muted",
                                        selectedConversation === convo.email && "bg-muted"
                                    )}
                                    onClick={() => setSelectedConversation(convo.email)}
                                >
                                    <p className="font-semibold text-sm">{convo.email}</p>
                                    <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                                </div>
                             ))}
                        </CardContent>
                    </ScrollArea>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                         {selectedConversation ? (
                            <div className="flex items-center gap-2">
                                 <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                                    <ArrowLeft />
                                </Button>
                                <CardTitle className="text-base">Chat with {selectedConversation}</CardTitle>
                            </div>
                         ) : (
                             <CardTitle className="text-base">Select a conversation</CardTitle>
                         )}
                    </CardHeader>
                     {selectedConversation ? (
                        <>
                            <ScrollArea className="flex-1 p-4 space-y-4">
                                {currentMessages.map((msg) => {
                                    const isFromUser = msg.sender === selectedConversation;
                                    const senderName = isFromUser ? msg.sender : "You (Admin)";
                                    const fallback = senderName.charAt(0).toUpperCase();

                                    return (
                                        <div key={msg.id} className={`flex items-start gap-3 ${!isFromUser ? 'justify-end' : ''}`}>
                                            {isFromUser && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={`https://placehold.co/40x40/ffffff/000000.png?text=${fallback}`} alt={senderName} />
                                                    <AvatarFallback>{fallback}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`rounded-lg p-3 max-w-[70%] ${!isFromUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                <p className="text-sm font-semibold">{senderName}</p>
                                                {msg.imageUrl && <Image src={msg.imageUrl} alt="attachment" width={200} height={200} className="rounded-md my-2 w-full h-auto object-contain" />}
                                                <p className="text-sm mt-1">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${!isFromUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(msg.date).toLocaleString()}</p>
                                            </div>
                                            {!isFromUser && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={`https://placehold.co/40x40/673ab7/ffffff.png?text=${fallback}`} alt={senderName} />
                                                    <AvatarFallback>{fallback}</AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    )
                                })}
                            </ScrollArea>
                            <div className="p-4 border-t">
                                {attachment && (
                                <div className="relative w-24 h-24 mb-2">
                                    <Image src={attachment} alt="Preview" layout="fill" objectFit="cover" className="rounded" />
                                    <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => {setAttachment(null); if(fileInputRef.current) fileInputRef.current.value = "";}}>
                                    <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input 
                                        placeholder="Type your message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        disabled={isLoading}
                                    />
                                     <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    <Button onClick={handleSend} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Send"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-muted-foreground">Select a conversation to view messages.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
  }

  // User View
  return (
      <Card className="flex flex-col h-[calc(100vh-10rem)] border-0 shadow-none">
        <ScrollArea className="flex-1 p-4 space-y-4 -mx-6">
            {currentMessages.map((msg) => {
                 const isCurrentUser = msg.sender === currentUser?.email;
                 const senderName = isCurrentUser ? "You" : msg.sender === "admin@stakinghub.com" ? "Support Team" : msg.sender;
                 const fallback = senderName.charAt(0).toUpperCase();

                 return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                        {!isCurrentUser && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/40x40/673ab7/ffffff.png?text=${fallback}`} alt={senderName} />
                                <AvatarFallback>{fallback}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`rounded-lg p-3 max-w-[70%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="text-sm font-semibold">{senderName}</p>
                             {msg.imageUrl && <Image src={msg.imageUrl} alt="attachment" width={200} height={200} className="rounded-md my-2 w-full h-auto object-contain" />}
                            <p className="text-sm mt-1">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(msg.date).toLocaleString()}</p>
                        </div>
                        {isCurrentUser && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/40x40/ffffff/000000.png?text=${fallback}`} alt={senderName} />
                                <AvatarFallback>{fallback}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                )
            })}
        </ScrollArea>
        <div className="p-4 border-t -mx-6">
            {attachment && (
              <div className="relative w-24 h-24 mb-2">
                <Image src={attachment} alt="Preview" layout="fill" objectFit="cover" className="rounded" />
                <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => {setAttachment(null); if(fileInputRef.current) fileInputRef.current.value = "";}}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
                <Input 
                    placeholder="Type your message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isLoading}
                />
                 <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <Button onClick={handleSend} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Send"}
                </Button>
            </div>
        </div>
      </Card>
  );
}
