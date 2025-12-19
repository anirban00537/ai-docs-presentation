import { getPostsSSR } from "@/services/blog";
import { format } from "date-fns";
import Link from "next/link";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Blog | Butterfast",
  description: "Insights, tutorials, and updates from the Butterfast team.",
};

export default async function BlogPage() {
  console.log("[BlogPage] Rendering...");
  const postsResponse = await getPostsSSR({ page: 1, perPage: 20 });
  console.log("[BlogPage] postsResponse:", postsResponse);
  const posts = postsResponse?.data?.posts || [];
  console.log("[BlogPage] posts count:", posts.length);

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="container max-w-3xl mx-auto px-6">
        <header className="mb-16 border-b border-slate-100 pb-8">
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-slate-900 tracking-tight mb-6">
              Stories
            </h1>
            <p className="text-xl text-slate-500 font-serif leading-relaxed">
              Insights on AI, productivity, and modern storytelling.
            </p>
        </header>

        <div className="space-y-12">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <article key={post.id} className="group relative flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-slate-100 last:border-0">
                 <div className="flex-1 min-w-0 space-y-3">
                    {/* Author Meta */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden relative">
                           {post.author.photo ? (
                             <img src={post.author.photo} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-400">
                               <User size={12} />
                             </div>
                           )}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                            {post.author.first_name} {post.author.last_name}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-500 font-serif">
                            {format(new Date(post.publishedAt), "MMM d, yyyy")}
                        </span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block">
                        <h2 className="text-2xl font-bold font-serif text-slate-900 leading-tight mb-2 group-hover:underline decoration-slate-300 underline-offset-4">
                            {post.title}
                        </h2>
                        <p className="text-base text-slate-500 font-serif leading-relaxed line-clamp-3 md:line-clamp-2">
                            {post.excerpt}
                        </p>
                    </Link>

                    <div className="flex items-center gap-4 pt-2">
                         {post.category && (
                           <Badge variant="secondary" className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-normal px-3 py-1 text-xs">
                             {post.category.name}
                           </Badge>
                         )}
                         <span className="text-xs text-slate-400">
                             {Math.ceil((post.content?.length || 0) / 1000)} min read
                         </span>
                    </div>
                 </div>

                 {/* Thumbnail Image */}
                 {post.featuredImg && (
                   <Link href={`/blog/${post.slug}`} className="shrink-0 w-full md:w-40 aspect-[4/3] md:aspect-square bg-slate-50 relative overflow-hidden rounded-md order-first md:order-last">
                      <img 
                        src={post.featuredImg} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                   </Link>
                 )}
              </article>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-serif text-xl">No stories published yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
