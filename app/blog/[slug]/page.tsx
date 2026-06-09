import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { POSTS, getPost } from "@/lib/blog/posts";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, url: `https://roomward.app/blog/${post.slug}` },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const html = await marked.parse(post.content);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: post.title, description: post.description, datePublished: post.date,
    author: { "@type": "Organization", name: "Roomward" },
    publisher: { "@type": "Organization", name: "Roomward" },
  };

  return (
    <div className="min-h-screen bg-[#080811] text-zinc-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between max-w-2xl mx-auto px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 rounded-lg shadow-lg shadow-indigo-500/30" />
          <span className="text-lg font-bold">Roomward</span>
        </Link>
        <Link href="/signup" className="btn-primary text-sm">Start free trial</Link>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-8 pb-24">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6">
          <ArrowLeft className="h-3 w-3" /> All posts
        </Link>
        <p className="text-[11px] text-zinc-500">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.readMins} min read</p>
        <h1 className="text-3xl font-bold tracking-tight mt-2 leading-tight">{post.title}</h1>

        <article
          className="mt-8 text-[15px] text-zinc-300 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zinc-100 [&_h2]:mt-9 [&_h2]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_li]:leading-relaxed [&_strong]:text-zinc-100 [&_strong]:font-semibold [&_a]:text-indigo-400 [&_a:hover]:text-indigo-300 [&_em]:text-zinc-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA */}
        <div className="mt-12 glass-card p-6 text-center border-indigo-500/20">
          <p className="text-sm font-semibold text-zinc-100">See Roomward in action</p>
          <p className="text-sm text-zinc-500 mt-1">Live floor plans, work orders, and a real-time housekeeping board — set up in minutes.</p>
          <Link href="/signup" className="btn-primary mt-4 inline-flex">Start free trial <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </main>
    </div>
  );
}
