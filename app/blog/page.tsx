import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { POSTS } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog — hotel operations, maintenance & housekeeping",
  description: "Practical guides on hotel operations, preventive maintenance, CMMS software, and housekeeping — from the team building Roomward.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <div className="min-h-screen bg-[#080811] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between max-w-3xl mx-auto px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 rounded-lg shadow-lg shadow-indigo-500/30" />
          <span className="text-lg font-bold">Roomward</span>
        </Link>
        <Link href="/signup" className="btn-primary text-sm">Start free trial</Link>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-10 pb-24">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">The Roomward blog</h1>
        <p className="text-zinc-400 mt-2">Guides on running hotels and facilities — maintenance, housekeeping, and operations.</p>

        <div className="mt-10 space-y-4">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="block glass-card p-6 hover:border-white/[0.12] transition-colors group">
              <p className="text-[11px] text-zinc-500">{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {p.readMins} min read</p>
              <h2 className="text-lg font-semibold text-zinc-100 mt-1 group-hover:text-indigo-300 transition-colors">{p.title}</h2>
              <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{p.description}</p>
              <span className="inline-flex items-center gap-1 text-xs text-indigo-400 mt-3">Read <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" /></span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
