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
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6"
          >
             <span className="flex items-center gap-1.5">
               <Calendar size={12} />
               {format(new Date(post.publishedAt), "MMM d, yyyy")}
             </span>
             <span className="w-1 h-1 rounded-full bg-slate-200" />
             <span className="flex items-center gap-1.5">
               <Clock size={12} />
               {Math.ceil(post.content.length / 1000)} min read
             </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-slate-900 leading-[1.2] mb-8 tracking-tight"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
             <div className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-white border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden ring-2 ring-white">
                  {post.author.photo ? <img src={post.author.photo} alt="" className="w-full h-full object-cover" /> : <User size={14} />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                     {post.author.first_name} {post.author.last_name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Author</p>
                </div>
             </div>
          </motion.div>
        </header>

        {/* Featured Image */}
        {post.featuredImg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-16 rounded-[32px] overflow-hidden border border-white/60 bg-white/40 p-1.5 shadow-xl shadow-slate-200/50"
            style={{
                backdropFilter: "blur(24px) saturate(180%)",
            }}
          >
            <div className="relative aspect-[21/9] rounded-[24px] overflow-hidden bg-slate-100">
                <img src={post.featuredImg} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        )}

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-20 max-w-3xl mx-auto"
        >
          <MarkdownReader content={post.content.body || post.content} className="max-w-none prose-lg prose-slate prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-img:rounded-2xl prose-img:shadow-lg" />
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
