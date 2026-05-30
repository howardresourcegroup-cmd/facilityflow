"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Channel, Message } from "@/types";
import { MOCK_PROFILES } from "@/lib/mock-data";

// Demo seed channels + messages. In production these come from Supabase.
const SEED_CHANNELS: Channel[] = [
  { id: "ch-general",  organization_id: "org-amicolola", name: "general",     description: "Team-wide updates",          is_private: false, created_by: "m1", created_at: "2026-01-01T00:00:00Z" },
  { id: "ch-maint",    organization_id: "org-amicolola", name: "maintenance",  description: "Maintenance team channel",    is_private: false, created_by: "m1", created_at: "2026-01-01T00:00:00Z" },
  { id: "ch-hskp",     organization_id: "org-amicolola", name: "housekeeping", description: "Housekeeping coordination",   is_private: false, created_by: "m1", created_at: "2026-01-01T00:00:00Z" },
  { id: "ch-urgent",   organization_id: "org-amicolola", name: "urgent",       description: "Time-sensitive issues only", is_private: false, created_by: "m1", created_at: "2026-01-01T00:00:00Z" },
];

const now = Date.now();
const SEED_MESSAGES: Message[] = [
  { id: "msg-1", channel_id: "ch-general", organization_id: "org-amicolola", author_id: "m1", body: "Morning team — heads up, Room 306 has a burst pipe. Marcus is on it. Front desk, please hold 308 for the guest relocation.", work_order_id: null, space_id: "s-306", edited: false, created_at: new Date(now - 95 * 60000).toISOString(), author: MOCK_PROFILES[5] },
  { id: "msg-2", channel_id: "ch-general", organization_id: "org-amicolola", author_id: "t1", body: "On it. Water's shut off to the room. Assessing drywall damage now.", work_order_id: null, space_id: null, edited: false, created_at: new Date(now - 88 * 60000).toISOString(), author: MOCK_PROFILES[0] },
  { id: "msg-3", channel_id: "ch-general", organization_id: "org-amicolola", author_id: "t2", body: "I can cover Marcus's 11am AC check in 204 if needed.", work_order_id: null, space_id: null, edited: false, created_at: new Date(now - 80 * 60000).toISOString(), author: MOCK_PROFILES[1] },
  { id: "msg-4", channel_id: "ch-general", organization_id: "org-amicolola", author_id: "m1", body: "Perfect, thanks Priya.", work_order_id: null, space_id: null, edited: false, created_at: new Date(now - 78 * 60000).toISOString(), author: MOCK_PROFILES[5] },
  { id: "msg-5", channel_id: "ch-maint", organization_id: "org-amicolola", author_id: "t3", body: "HVAC unit 2 is throwing fault code E-14 again. Ordered a replacement capacitor, ETA tomorrow.", work_order_id: null, space_id: "s-mechanical", edited: false, created_at: new Date(now - 60 * 60000).toISOString(), author: MOCK_PROFILES[2] },
  { id: "msg-6", channel_id: "ch-hskp", organization_id: "org-amicolola", author_id: "m1", body: "Rooms 202, 206, and 303 flagged dirty in RoomMaster — turnover crew please confirm when done.", work_order_id: null, space_id: null, edited: false, created_at: new Date(now - 40 * 60000).toISOString(), author: MOCK_PROFILES[5] },
];

interface ChatState {
  channels: Channel[];
  messages: Message[];
  activeChannelId: string;
  setActiveChannel: (id: string) => void;
  sendMessage: (body: string, authorId: string) => void;
  // Used by the Supabase realtime path to merge an inbound message
  receiveMessage: (msg: Message) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      channels: SEED_CHANNELS,
      messages: SEED_MESSAGES,
      activeChannelId: "ch-general",

      setActiveChannel: (id) => set({ activeChannelId: id }),

      sendMessage: (body, authorId) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const author = MOCK_PROFILES.find((p) => p.id === authorId) ?? MOCK_PROFILES[5];
        const msg: Message = {
          id: `msg-${Date.now()}`,
          channel_id: get().activeChannelId,
          organization_id: "org-amicolola",
          author_id: authorId,
          body: trimmed,
          work_order_id: null,
          space_id: null,
          edited: false,
          created_at: new Date().toISOString(),
          author,
        };
        set((s) => ({ messages: [...s.messages, msg] }));
        // In production: also INSERT into Supabase `messages` (RLS-guarded);
        // realtime broadcasts it to every other org member.
      },

      receiveMessage: (msg) =>
        set((s) =>
          s.messages.some((m) => m.id === msg.id) ? s : { messages: [...s.messages, msg] }
        ),
    }),
    { name: "facilityflow-chat" }
  )
);
