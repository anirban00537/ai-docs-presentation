"use client";

import { usePost } from "@/hooks/use-blog";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, User, Clock, ChevronLeft, Share2, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownReader } from "@/components/ui/markdown-reader";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: postResponse, isLoading } = usePost(slug as string);
  const post = postResponse?.data;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20">
        <div className="container max-w-4xl mx-auto px-4">
          <Skeleton className="h-4 w-20 mb-8 rounded-full" />
          <Skeleton className="h-16 w-full mb-6 rounded-2xl" />
          <Skeleton className="h-6 w-2/3 mb-10 rounded-xl" />
          <div className="flex gap-4 mb-12">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-[400px] w-full mb-12 rounded-[40px]" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Post Not Found</h1>
        <p className="text-slate-500 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/blog")} className="rounded-2xl h-12 px-8 font-bold">
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <article className="container max-w-4xl mx-auto px-4">
        {/* Navigation & Category */}
        <div className="flex items-center justify-between mb-10">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/blog")}
            className="rounded-xl font-bold gap-2 text-slate-500 hover:text-primary transition-all p-0 hover:bg-transparent"
          >
            <ChevronLeft size={20} />
            Back to Articles
          </Button>
          {post.category && (
            <Badge className="bg-primary/5 text-primary border-primary/10 rounded-lg px-4 py-1 font-bold capitalize">
              {post.category.name}
            </Badge>
          )}
        </div>

        {/* Header */}
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-8"
          >
            {post.title}
          </motion.h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                {post.author.photo ? (
                    <img src={post.author.photo} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <User size={20} />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {post.author.first_name} {post.author.last_name}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {format(new Date(post.publishedAt), "MMM d, yyyy")}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {Math.ceil(post.content.length / 1000)} min read
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-xl border-slate-100 text-slate-400 hover:text-sky-500 hover:border-sky-100 hover:bg-sky-50 transition-all" onClick={copyLink}>
                <Twitter size={18} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all" onClick={copyLink}>
                <Facebook size={18} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl border-slate-100 text-slate-400 hover:text-primary hover:border-primary/10 hover:bg-primary/5 transition-all" onClick={copyLink}>
                <LinkIcon size={18} />
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-16 rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/50"
          >
            <img src={post.featuredImg} alt={post.title} className="w-full h-auto object-cover max-h-[600px]" />
          </motion.div>
        )}

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pb-20"
        >
          <MarkdownReader content={post.content.body || post.content} className="max-w-none prose-lg md:prose-xl prose-slate prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900" />
        </motion.div>

        {/* Footer Meta */}
        <footer className="pt-12 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tagged in:</span>
              <div className="flex gap-2">
                 {post.metaKeywords.split(',').map((kw: string, i: number) => (
                   <Badge key={i} variant="secondary" className="bg-slate-50 text-slate-500 rounded-md border-none font-bold text-[10px] uppercase">
                     {kw.trim()}
                   </Badge>
                 ))}
              </div>
           </div>
           
           <Button className="rounded-2xl h-12 px-8 font-bold gap-2">
              <Share2 size={18} />
              Share Article
           </Button>
        </footer>
      </article>
    </div>
  );
}
