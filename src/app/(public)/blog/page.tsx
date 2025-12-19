"use client";

import { usePosts } from "@/hooks/use-blog";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const { data: postsResponse, isLoading } = usePosts({ page: 1, perPage: 12 });
  const posts = postsResponse?.data?.posts || [];

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20">
      <div className="container max-w-7xl mx-auto px-6">
        <header className="mb-20 text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest shadow-sm border border-primary/20"
          >
            Insights & Updates
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.1]"
          >
            Explore our latest thoughts on <span className="text-primary/80 italic">AI</span> & <span className="text-primary/80 italic">Productivity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 font-medium leading-relaxed"
          >
            Discover tutorials, case studies, and industry insights to help you build better presentations faster.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="rounded-3xl overflow-hidden bg-white/40 border border-white/60 shadow-xl shadow-slate-200/40 p-1"
                style={{
                    backdropFilter: "blur(24px) saturate(180%)",
                }}
              >
                <div className="aspect-video bg-slate-100/50 animate-pulse rounded-[20px]" />
                <div className="p-6 space-y-4">
                  <div className="h-4 w-24 bg-slate-200/50 animate-pulse rounded" />
                  <div className="h-8 w-full bg-slate-200/50 animate-pulse rounded-lg" />
                  <div className="h-4 w-2/3 bg-slate-200/50 animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post: any, idx: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="h-full"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <motion.div 
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative h-full flex flex-col rounded-3xl overflow-hidden border border-white/60 bg-white/40 p-1.5 transition-all duration-300"
                    style={{
                        backdropFilter: "blur(24px) saturate(180%)",
                        boxShadow: `
                          0 1px 0 0 rgba(255, 255, 255, 0.8) inset,
                          0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
                          0 20px 40px rgba(0, 0, 0, 0.05),
                          0 1px 2px rgba(0, 0, 0, 0.1)
                        `
                    }}
                  >
                    {/* Glass shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />

                    <div className="aspect-[16/10] relative overflow-hidden rounded-[20px] bg-slate-100">
                      {post.featuredImg ? (
                        <img
                          src={post.featuredImg}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                          <Calendar size={48} className="opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 z-20">
                        {post.category && (
                          <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-sm capitalize font-bold px-3 py-1">
                            {post.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {format(new Date(post.publishedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-slate-500 line-clamp-3 font-medium leading-relaxed text-sm mb-6">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden ring-2 ring-white">
                            {post.author.photo ? <img src={post.author.photo} className="w-full h-full object-cover" /> : <User size={14} />}
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {post.author.first_name} {post.author.last_name}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-all shadow-sm">
                            <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 font-bold text-xl">No posts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
