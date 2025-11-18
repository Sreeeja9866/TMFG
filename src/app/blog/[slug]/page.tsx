import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getBlogPost(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug }
    })
    return post
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [post.image] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <main>
      <Navbar />

      {/* Header Section */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-8">
            <span className="inline-block text-white bg-secondary px-4 py-2 rounded-full font-semibold mb-4">
              {post.category || 'Blog'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">{post.title}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>By {post.author}</span>
              <span>•</span>
              <span>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }) : 'No date'}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative w-full max-w-3xl mx-auto h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5">
            <Image
              src={post.image || '/images/logo.png'}
              alt={post.title}
              fill
              className="object-contain p-6"
              priority
            />
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <article className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          {post.excerpt && (
            <div className="text-xl text-gray-600 mb-8 pb-8 border-b">
              {post.excerpt}
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              ← Back to All Posts
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
