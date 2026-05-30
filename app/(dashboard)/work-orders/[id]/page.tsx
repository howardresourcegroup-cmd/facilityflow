"use client";
export const runtime = "edge";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight, MapPin, Calendar, User, Send, Paperclip,
  CheckCircle2, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { WorkOrderStatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { useWorkOrder, useProfiles, usePermissions } from "@/lib/data/hooks";
import { fetchComments, addComment, assignWorkOrder } from "@/lib/data/queries";
import { PageLoader } from "@/components/shared/loading-spinner";
import { cn, WORK_ORDER_STATUS_CONFIG, getInitials, formatDateTime, timeAgo } from "@/lib/utils";
import type { WorkOrderStatus } from "@/types";

const STATUS_FLOW: WorkOrderStatus[] = ["open", "assigned", "in_progress", "waiting_parts", "completed"];

interface CommentRow { id: string; content: string; created_at: string; author?: { full_name: string } }

export default function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { order, loading, setStatus } = useWorkOrder(id);
  const { profiles } = useProfiles();
  const { can } = usePermissions();

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [assigneeOverride, setAssigneeOverride] = useState<{ id: string; full_name: string; role: string } | null | undefined>(undefined);

  const handleAssign = async (profileId: string) => {
    const p = profiles.find((x) => x.id === profileId);
    setAssigneeOverride(p ? { id: p.id, full_name: p.full_name, role: p.role } : null);
    try { await assignWorkOrder(id, profileId || null); } catch { /* ignore */ }
  };

  // Load persisted comments
  useEffect(() => {
    fetchComments(id).then((c) => setComments(c as CommentRow[])).catch(() => {});
  }, [id]);

  const addCommentHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const saved = await addComment(id, comment.trim());
      setComments((prev) => [...prev, saved as CommentRow]);
      setComment("");
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  if (loading) return <PageLoader />;
  if (!order) return <div className="text-sm text-zinc-500 py-12 text-center">Work order not found.</div>;

  const currentStep = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/work-orders" className="hover:text-zinc-300 transition-colors">Work Orders</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-300 truncate max-w-[240px]">{order.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-start gap-3 flex-wrap">
              <PriorityBadge priority={order.priority} />
              <WorkOrderStatusBadge status={order.status} />
              <span className="badge bg-white/[0.04] border-white/[0.06] text-zinc-500 capitalize">
                {order.category}
              </span>
              {order.created_at.startsWith("rm-") ||
               order.description?.includes("RoomMaster") ? (
                <span className="badge bg-blue-500/15 border-blue-500/30 text-blue-400">
                  Via RoomMaster
                </span>
              ) : null}
            </div>
            <h1 className="text-xl font-semibold text-zinc-100 leading-snug">{order.title}</h1>
            {order.description && (
              <p className="text-sm text-zinc-400 leading-relaxed">{order.description}</p>
            )}
          </div>

          {/* Progress */}
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-5">Progress</p>
            <div className="flex items-center gap-0">
              {STATUS_FLOW.map((s, i) => {
                const cfg = WORK_ORDER_STATUS_CONFIG[s];
                const done   = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => setStatus(s)}
                      className={cn("flex flex-col items-center gap-1.5 group transition-all", done ? "opacity-100" : "opacity-40 hover:opacity-60")}
                    >
                      <div className={cn(
                        "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all",
                        active ? cn("border-indigo-500 bg-indigo-500/20") : done ? "border-emerald-500 bg-emerald-500/20" : "border-zinc-700"
                      )}>
                        {done && !active
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          : <span className={cn("h-2 w-2 rounded-full", active ? "bg-indigo-400" : "bg-zinc-600")} />}
                      </div>
                      <span className={cn("text-[10px] font-medium text-center whitespace-nowrap", active ? cfg.color : "text-zinc-600")}>
                        {cfg.label}
                      </span>
                    </button>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={cn("flex-1 h-0.5 mx-1 mb-5", i < currentStep ? "bg-emerald-500/40" : "bg-zinc-800")} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div className="glass-card p-5 space-y-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Activity</p>
            {comments.length === 0 && (
              <p className="text-xs text-zinc-600 py-2">No updates yet.</p>
            )}
            <div className="space-y-4">
              {comments.map((c) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px]">{getInitials(c.author?.full_name ?? "?")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-300">{c.author?.full_name ?? "Unknown"}</span>
                      <span className="text-xs text-zinc-600">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{c.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Separator />
            <form onSubmit={addCommentHandler} className="space-y-3">
              <Textarea
                placeholder="Add an update, photo note, or observation…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <button type="button" className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  <Paperclip className="h-3.5 w-3.5" />
                  Attach photo
                </button>
                <Button type="submit" size="sm" disabled={submitting || !comment.trim()}>
                  <Send className="h-3.5 w-3.5" />
                  {submitting ? "Posting…" : "Post Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-4 space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Details</p>
            {order.space && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
                <span className="text-zinc-400">{order.space.name}</span>
              </div>
            )}
            {order.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-zinc-600 shrink-0" />
                <span className="text-zinc-400">{formatDateTime(order.due_date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-zinc-600 shrink-0" />
              <span className="text-zinc-400">Created {timeAgo(order.created_at)}</span>
            </div>
            {order.creator && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-zinc-600 shrink-0" />
                <span className="text-zinc-400">by {order.creator.full_name}</span>
              </div>
            )}
          </div>

          <div className="glass-card p-4 space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Assignee</p>
            {(() => {
              const assignee = assigneeOverride !== undefined ? assigneeOverride : order.assignee;
              return assignee ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(assignee.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{assignee.full_name}</p>
                    <p className="text-xs text-zinc-500 capitalize">{assignee.role}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-600">Unassigned</p>
              );
            })()}
            {can("work_orders.assign") && (
              <Select onValueChange={handleAssign}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Assign technician…" /></SelectTrigger>
                <SelectContent>
                  {profiles.filter((p) => p.role !== "viewer").map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="glass-card p-4 space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</p>
            {order.status !== "completed" && order.status !== "cancelled" && can("work_orders.complete") && (
              <Button size="sm" variant="success" className="w-full" onClick={() => setStatus("completed")}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Completed
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
