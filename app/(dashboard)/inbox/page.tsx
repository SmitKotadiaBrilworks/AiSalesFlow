"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/use-conversations";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const { data: conversations, isLoading: isLoadingConversations } =
    useConversations();
  const { data: messages, isLoading: isLoadingMessages } =
    useMessages(selectedId);
  const sendMessage = useSendMessage();

  // Auto-select first conversation (only when conversations first load)
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedId) {
      setSelectedId(conversations[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.name.toLowerCase().includes(query) ||
        conv.email.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const selectedConversation = conversations?.find((c) => c.id === selectedId);

  const handleSendMessage = async () => {
    if (!reply.trim() || !selectedId || !user?.id) return;

    try {
      await sendMessage.mutateAsync({
        leadId: selectedId,
        content: reply.trim(),
        senderType: "user",
        senderId: user.id,
      });
      setReply("");
      toast.success("Message sent and email delivered to lead");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation List */}
      <Card className="w-1/3 flex flex-col">
        <div className="p-4 border-b space-y-4">
          <h2 className="font-semibold text-lg">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filteredConversations.map((conv) => (
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
                    <div className="flex flex-col">
                      <span>{conv.name}</span>
                      {conv.unread && (
                        <span className="text-xs font-normal text-indigo-600">
                          {conv.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {conv.time}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-1 ml-10">
                  {conv.lastMessage}
                </p>
              </div>
            ))
          )}
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
              {/* <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div> */}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages && messages.length > 0 ? (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col",
                        msg.sender === "lead"
                          ? "self-start"
                          : "self-end items-end "
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-lg text-sm shadow-sm break-words max-w-[80%]",
                          msg.sender === "lead"
                            ? "bg-white text-slate-800 border"
                            : msg.sender === "ai"
                            ? "bg-indigo-50 text-indigo-900 border border-indigo-100"
                            : "bg-indigo-600 text-white"
                        )}
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {msg.sender === "ai" && (
                          <span className="text-xs font-bold block mb-1 text-indigo-500">
                            AI Assistant
                          </span>
                        )}
                        <span
                          className="break-words whitespace-pre-wrap"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {msg.content}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No messages yet
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessage.isPending}
                />
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleSendMessage}
                  disabled={!reply.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-green-600">📧</span>
                  Messages will be delivered via email
                </p>
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
                >
                  ✨ AI Suggest: &quot;Here is the pricing breakdown...&quot;
                </Button> */}
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
