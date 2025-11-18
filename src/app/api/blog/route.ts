import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all blog posts or a single post by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const published = searchParams.get('published')

    if (slug) {
      // Get single post by slug
      const post = await prisma.blogPost.findUnique({
        where: { slug },
      })

      if (!post) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ post }, { status: 200 })
    }

    // Get all posts
    const posts = await prisma.blogPost.findMany({
      where: published === 'true' ? { published: true } : undefined,
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json({ posts }, { status: 200 })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// CREATE a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      author,
      category,
      tags,
      image,
      published,
    } = body

    // Validate required fields
    if (!title || !slug || !content || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'Blog post with this slug already exists' },
        { status: 409 }
      )
    }

    // Create blog post
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        author,
        category: category || null,
        tags: tags || [],
        image: image || null,
        published: published || false,
        publishedAt: published ? new Date() : null,
      },
    })

    return NextResponse.json(
      { message: 'Blog post created successfully', post },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

// UPDATE a blog post
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...updateData,
        publishedAt: updateData.published && !updateData.publishedAt
          ? new Date()
          : updateData.publishedAt,
      },
    })

    return NextResponse.json(
      { message: 'Blog post updated successfully', post },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE a blog post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
