import { getPostsSSR } from "@/services/blog";
import { format } from "date-fns";
import Link from "next/link";
import { User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "Blog | Butterfast",
  description: "Insights, tutorials, and updates from the Butterfast team.",
};

export default async function BlogPage() {
  const postsResponse = await getPostsSSR({ page: 1, perPage: 20 });
  const posts = postsResponse?.data?.posts || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-28 pb-20">
        <div className="container max-w-7xl mx-auto px-6">
          {/* Header */}
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
              Insights on AI, productivity, and modern storytelling to help you create better presentations.
            </p>
          </header>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length > 0 ? (
              posts.map((post: any) => (
                <article key={post.id} className="group flex flex-col h-full border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                    {/* Thumbnail */}
                    {post.featuredImg ? (
                      <div className="shrink-0 w-full aspect-[16/10] bg-slate-100 overflow-hidden relative">
                        <img 
                          src={post.featuredImg} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-sm capitalize font-bold px-3 py-1 hover:bg-white">
                              {post.category.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="shrink-0 w-full aspect-[16/10] bg-slate-100/50 flex items-center justify-center p-8 relative">
                         {post.category && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-sm capitalize font-bold px-3 py-1 hover:bg-white">
                              {post.category.name}
                            </Badge>
                          </div>
                        )}
                         <h3 className="text-2xl font-bold text-slate-300/50 tracking-tighter">BUTTERFAST</h3>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                         <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                         <span>•</span>
                         <span>{Math.ceil((post.content?.length || 0) / 1000)} min read</span>
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-slate-500 leading-relaxed text-sm mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm">
                            {post.author.image ? (
                              <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200">
                                <User size={14} />
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {post.author.name}
                          </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 text-lg">No posts published yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
