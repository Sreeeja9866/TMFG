import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { prisma } from '@/lib/prisma'

// Create new blog post
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      author,
      category,
      tags = [],
      image,
      published = false,
      publishedAt
    } = body

    // Validate required fields
    if (!title || !slug || !content || !author) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content, author' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 409 }
      )
    }

    // Create blog post
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        author,
        category,
        tags: Array.isArray(tags) ? tags : [],
        image,
        published,
        publishedAt: published && !publishedAt ? new Date() : publishedAt ? new Date(publishedAt) : null
      }
    })

    return NextResponse.json({
      message: 'Blog post created successfully',
      post
    })
  } catch (error) {
    console.error('Create blog post error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

// Get all blog posts (including unpublished for admin)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

    const posts = await prisma.blogPost.findMany({
      where: includeUnpublished ? undefined : { published: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Get blog posts error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}
