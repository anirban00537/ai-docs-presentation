import { getPostSSR } from "@/services/blog";
import { format } from "date-fns";
import Link from "next/link";
import { User, ArrowLeft, Clock } from "lucide-react";
import { MarkdownReader } from "@/components/ui/markdown-reader";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";

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
  const { slug } = await params;
  const post = await getPostSSR(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-20">
        <Navbar />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6 text-slate-500">Post not found.</p>
        <Link href="/blog" className="text-base underline underline-offset-4 hover:text-slate-600 transition-colors">
            Back to stories
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pt-10">
      {/* Featured Image - Full Width Hero */}
      {post.featuredImg && (
        <div className="w-full">
          <div className="max-w-6xl mx-auto px-4">
            <img 
              src={post.featuredImg} 
              alt={post.title} 
              className="w-full h-auto max-h-[600px] object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="max-w-[900px] mx-auto px-6 py-12">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Blog</span>
        </Link>

        {/* Category */}
        {post.category && (
          <div className="mb-4">
            <Badge className="bg-primary/10 text-primary border-none rounded-md px-3 py-1 text-xs font-semibold">
              {post.category.name}
            </Badge>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-[1.15] tracking-tight mb-6">
          {post.title}
        </h1>

        {/* Subtitle/Excerpt */}
        {post.excerpt && (
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-8">
            {post.excerpt}
          </p>
        )}

        {/* Author Section */}
        <div className="flex items-center gap-4 pb-8 border-b border-slate-100 mb-10">
          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
            {post.author.photo ? (
              <img src={post.author.photo} alt={post.author.first_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-lg">
                {post.author.first_name?.[0]}{post.author.last_name?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">
              {post.author.first_name} {post.author.last_name}
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{format(new Date(post.publishedAt), "MMMM d, yyyy")}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {Math.ceil((post.content?.body?.length || post.content?.length || 0) / 1000)} min read
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none 
          prose-p:text-slate-700 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
          prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
          prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-strong:text-slate-900 prose-strong:font-semibold
          prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80
          prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600
          prose-img:rounded-xl prose-img:my-8 prose-img:shadow-lg
          prose-ul:my-6 prose-ol:my-6
          prose-li:text-lg prose-li:leading-relaxed prose-li:text-slate-700
          prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-slate-800
          prose-pre:bg-slate-900 prose-pre:rounded-xl prose-pre:p-6
        ">
          <MarkdownReader content={post.content.body || post.content} />
        </div>

        {/* Tags */}
        {post.metaKeywords && (
          <div className="mt-16 pt-8 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Topics</p>
            <div className="flex flex-wrap gap-2">
              {post.metaKeywords.split(',').map((kw: string, i: number) => (
                <Badge key={i} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors">
                  {kw.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Author Footer */}
        <div className="mt-12 p-8 bg-slate-50 rounded-2xl">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
              {post.author.photo ? (
                <img src={post.author.photo} alt={post.author.first_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-xl">
                  {post.author.first_name?.[0]}{post.author.last_name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-slate-900 mb-1">
                {post.author.first_name} {post.author.last_name}
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Sharing insights on AI, productivity, and modern storytelling. Thanks for reading!
              </p>
            </div>
          </div>
        </div>

        {/* Back to Blog Link */}
        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold">
            <ArrowLeft size={18} />
            Back to all articles
          </Link>
        </div>
      </div>
    </article>
  );
}
