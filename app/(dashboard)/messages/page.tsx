"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Hash, Send, Lock, ShieldCheck, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChannels, useMessages, useProfiles, useCurrentProfile } from "@/lib/data/hooks";
import { cn, getInitials, timeAgo } from "@/lib/utils";

export default function MessagesPage() {
  const channels = useChannels();
  const { profiles } = useProfiles();
  const me = useCurrentProfile();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const { messages, send } = useMessages(activeChannelId);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Default to the first channel once loaded
  useEffect(() => {
    if (!activeChannelId && channels.length) setActiveChannelId(channels[0].id);
  }, [channels, activeChannelId]);

  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const channelMessages = [...messages].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  const CURRENT_USER_ID = me?.id;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [channelMessages.length, activeChannelId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    send(draft);
    setDraft("");
  };

  const onlineCount = profiles.filter((p) => p.is_available).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Team Chat</h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Encrypted in transit &amp; at rest
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Users className="h-3.5 w-3.5" />
              {onlineCount} online
            </span>
          </div>
        </div>
      </div>

      {/* Chat layout */}
      <div className="glass-card overflow-hidden grid grid-cols-1 md:grid-cols-[200px_1fr] h-[calc(100vh-220px)] min-h-[480px]">
        {/* Channel list */}
        <div className="border-r border-white/[0.05] flex flex-col">
          <div className="px-3 py-3 border-b border-white/[0.05]">
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-2">Channels</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {channels.map((ch) => {
              const isActive = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-left transition-all",
                    isActive ? "bg-indigo-500/15 text-indigo-300" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05]"
                  )}
                >
                  <Hash className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="truncate flex-1">{ch.name}</span>
                  {ch.name === "urgent" && <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="p-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <Lock className="h-3 w-3" />
              AES-256 · TLS 1.3
            </div>
          </div>
        </div>

        {/* Message thread */}
        <div className="flex flex-col min-w-0">
          {/* Channel header */}
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-2">
            <Hash className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-200">{activeChannel?.name}</span>
            {activeChannel?.description && (
              <span className="text-xs text-zinc-600 border-l border-white/[0.08] pl-2 ml-1 truncate">
                {activeChannel.description}
              </span>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {channelMessages.map((msg, i) => {
              const isMe = msg.author_id === CURRENT_USER_ID;
              const prev = channelMessages[i - 1];
              const grouped = prev && prev.author_id === msg.author_id &&
                +new Date(msg.created_at) - +new Date(prev.created_at) < 5 * 60000;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", grouped && "mt-1")}
                >
                  {!grouped ? (
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className={cn("text-[10px]", isMe ? "bg-indigo-500/25 text-indigo-300" : "bg-white/[0.08] text-zinc-400")}>
                        {getInitials(msg.author?.full_name ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    {!grouped && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-sm font-medium text-zinc-200">{msg.author?.full_name}</span>
                        <span className="text-[10px] text-zinc-600 capitalize">{msg.author?.role}</span>
                        <span className="text-[10px] text-zinc-600">{timeAgo(msg.created_at)}</span>
                      </div>
                    )}
                    <p className="text-sm text-zinc-300 leading-relaxed break-words">{msg.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Lock className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message #${activeChannel?.name}`}
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none min-w-0"
              />
              <Button type="submit" size="icon-sm" disabled={!draft.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1.5 px-1">
              Messages are encrypted in transit (TLS 1.3) and at rest (AES-256). Only your organization can read this channel.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
