import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

async function getBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return posts
}

export const metadata = {
  title: 'Manage Blog',
}

export default async function AdminBlogPage() {
  const posts = await getBlogPosts()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-2">Manage your blog articles and content</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
        >
          + Add New Post
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Total Posts</p>
          <p className="text-3xl font-bold text-primary">{posts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Published</p>
          <p className="text-3xl font-bold text-green-600">
            {posts.filter(p => p.published).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Drafts</p>
          <p className="text-3xl font-bold text-gray-500">
            {posts.filter(p => !p.published).length}
          </p>
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No blog posts yet</p>
            <Link
              href="/admin/blog/new"
              className="text-primary hover:underline font-semibold"
            >
              Create your first blog post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex gap-6">
                  {/* Image */}
                  {post.image && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          {post.category && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {post.category}
                            </span>
                          )}
                          <span>
                            {post.published ? (
                              <span className="text-green-600 font-semibold">● Published</span>
                            ) : (
                              <span className="text-gray-400">● Draft</span>
                            )}
                          </span>
                          <span>By {post.author}</span>
                        </div>
                      </div>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors text-sm font-semibold"
                      >
                        Edit
                      </Link>
                    </div>

                    {post.excerpt && (
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Created: {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      {post.publishedAt && (
                        <span>
                          Published: {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
