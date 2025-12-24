"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Mock data
const conversations = [
  {
    id: 1,
    name: "Alice Smith",
    email: "alice@example.com",
    lastMessage: "Can you send me the pricing?",
    time: "10:30 AM",
    unread: true,
    initials: "AS",
  },
  {
    id: 2,
    name: "Bob Jones",
    email: "bob@example.com",
    lastMessage: "Thanks for the info!",
    time: "Yesterday",
    unread: false,
    initials: "BJ",
  },
  {
    id: 3,
    name: "Tech Corp",
    email: "contact@techcorp.com",
    lastMessage: "We are looking for a custom solution.",
    time: "2 days ago",
    unread: false,
    initials: "TC",
  },
];

const messages = [
  {
    id: 1,
    sender: "lead",
    content: "Hi, I saw your website and I am interested in your services.",
    time: "10:00 AM",
  },
  {
    id: 2,
    sender: "ai",
    content:
      "Hello! Thanks for reaching out. I'd be happy to help. What specific services are you looking for?",
    time: "10:01 AM",
  },
  {
    id: 3,
    sender: "lead",
    content: "I need help with SEO and content marketing.",
    time: "10:05 AM",
  },
  {
    id: 4,
    sender: "user",
    content: "Great, we have a package for that. Let me send you the details.",
    time: "10:15 AM",
  },
  {
    id: 5,
    sender: "lead",
    content: "Can you send me the pricing?",
    time: "10:30 AM",
  },
];

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [reply, setReply] = useState("");

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation List */}
      <Card className="w-1/3 flex flex-col">
        <div className="p-4 border-b space-y-4">
          <h2 className="font-semibold text-lg">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-8" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors",
                selectedId === conv.id
                  ? "bg-slate-50 border-l-4 border-l-indigo-600"
                  : "border-l-4 border-l-transparent"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-semibold flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{conv.initials}</AvatarFallback>
                  </Avatar>
                  {conv.name}
                </div>
                <span className="text-xs text-muted-foreground">
                  {conv.time}
                </span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-1">
                {conv.lastMessage}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Message View */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedConversation.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {selectedConversation.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedConversation.email}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.sender === "lead" ? "self-start" : "self-end items-end"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm shadow-sm",
                      msg.sender === "lead"
                        ? "bg-white text-slate-800 border"
                        : msg.sender === "ai"
                        ? "bg-indigo-50 text-indigo-900 border border-indigo-100"
                        : "bg-indigo-600 text-white"
                    )}
                  >
                    {msg.sender === "ai" && (
                      <span className="text-xs font-bold block mb-1 text-indigo-500">
                        AI Assistant
                      </span>
                    )}
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
                >
                  ✨ AI Suggest: &quot;Here is the pricing breakdown...&quot;
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to view messages
          </div>
        )}
      </Card>
    </div>
  );
}
