"use client";

import { usePosts } from "@/hooks/use-blog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar, User, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function BlogPage() {
  const { data: postsResponse, isLoading } = usePosts({ page: 1, perPage: 10 });
  const posts = postsResponse?.data?.posts || [];

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20">
      <div className="container max-w-6xl mx-auto px-4">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4"
          >
            Insights & Updates
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black text-slate-900 mb-4"
          >
            Our <span className="text-primary italic font-medium">Blog</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto font-medium"
          >
            Explore our latest thoughts on AI, productivity, and the future of storytelling.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-[32px] overflow-hidden border-slate-100 shadow-sm">
                <div className="aspect-video bg-slate-100 animate-pulse" />
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 w-24 bg-slate-100 animate-pulse rounded" />
                  <div className="h-6 w-full bg-slate-100 animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
          ) : posts.length > 0 ? (
            posts.map((post: any, idx: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card className="group rounded-[32px] overflow-hidden border-white shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-white/70 backdrop-blur-sm h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden bg-slate-100">
                      {post.featuredImg ? (
                        <img
                          src={post.featuredImg}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Calendar size={48} className="opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        {post.category && (
                          <Badge className="bg-white/90 backdrop-blur-md text-primary border-none shadow-sm capitalize font-bold">
                            {post.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                          <span className="flex items-center gap-1.5 leading-none">
                            <Clock size={14} className="text-slate-300" />
                            {format(new Date(post.publishedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-slate-500 line-clamp-3 font-medium leading-relaxed text-sm mb-6">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={14} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {post.author.first_name} {post.author.last_name}
                          </span>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
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
