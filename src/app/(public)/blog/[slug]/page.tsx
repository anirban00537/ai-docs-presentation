import { getPostSSR } from "@/services/blog";
import { format } from "date-fns";
import Link from "next/link";
import { User, ArrowLeft, Clock } from "lucide-react";
import { MarkdownReader } from "@/components/ui/markdown-reader";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostSSR(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Butterfast`,
    description: post.excerpt || post.title,
    openGraph: {
      images: post.featuredImg ? [post.featuredImg] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  console.log("[BlogPostPage] Rendering...");
  const { slug } = await params;
  console.log("[BlogPostPage] slug:", slug);
  const post = await getPostSSR(slug);
  console.log("[BlogPostPage] post:", post ? post.title : "null");

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 font-serif pt-20">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6 text-slate-500">Post not found.</p>
        <Link href="/blog" className="text-base font-sans underline underline-offset-4 hover:text-slate-600 transition-colors">
            Back to stories
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pt-24 pb-20">
      <div className="container max-w-3xl mx-auto px-6">
        {/* Navigation */}
        <div className="mb-12">
            <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-sans text-sm font-medium">Back to stories</span>
            </Link>
        </div>

        {/* Header */}
        <header className="mb-10 space-y-6">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight">
                {post.title}
            </h1>
            {post.excerpt && (
                <p className="text-xl md:text-2xl text-slate-500 font-serif leading-relaxed">
                    {post.excerpt}
                </p>
            )}
            
            <div className="flex items-center justify-between border-b border-t border-slate-100 py-6 mt-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden relative">
                       {post.author.photo ? (
                         <img src={post.author.photo} alt={post.author.first_name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-400">
                           <User size={20} />
                         </div>
                       )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-base font-medium text-slate-900 font-sans">
                            {post.author.first_name} {post.author.last_name}
                            <button className="text-emerald-600 font-sans text-sm hover:underline ml-2 hidden sm:inline-block">Follow</button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-sans">
                            <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {Math.ceil((post.content?.body?.length || post.content?.length || 0) / 1000)} min read
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* Featured Image */}
        {post.featuredImg && (
            <figure className="mb-14 -mx-6 md:-mx-0">
                <img 
                    src={post.featuredImg} 
                    alt={post.title} 
                    className="w-full h-auto max-h-[600px] object-cover md:rounded-sm bg-slate-50"
                />
            </figure>
        )}

        {/* Content */}
        <div className="prose prose-lg md:prose-xl prose-slate max-w-none font-serif prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-800 prose-img:rounded-md">
            <MarkdownReader content={post.content.body || post.content} />
        </div>

        {/* Footer / Tags */}
        <div className="mt-20 pt-10 border-t border-slate-100">
             <div className="flex flex-wrap gap-2 mb-8">
                {post.category && (
                    <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-sm font-normal rounded-full transition-colors cursor-pointer">
                        {post.category.name}
                    </Badge>
                )}
                {post.metaKeywords ? post.metaKeywords.split(',').map((kw: string, i: number) => (
                   <Badge key={i} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-sm font-normal rounded-full transition-colors cursor-pointer">
                     {kw.trim()}
                   </Badge>
                 )) : null}
             </div>
        </div>
      </div>
    </article>
  );
}
