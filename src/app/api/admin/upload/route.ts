import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'service' or 'blog'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['service', 'blog'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "service" or "blog"' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase()
    const filename = `${timestamp}-${originalName}`

    // Determine upload directory
    const uploadDir = type === 'service' ? 'services' : 'blog'
    const uploadsPath = path.join(process.cwd(), 'public', 'images', 'uploads', uploadDir)

    // Ensure directory exists
    if (!existsSync(uploadsPath)) {
      await mkdir(uploadsPath, { recursive: true })
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadsPath, filename)

    await writeFile(filePath, buffer)

    // Return the public URL path
    const publicPath = `/images/uploads/${uploadDir}/${filename}`

    return NextResponse.json({
      message: 'File uploaded successfully',
      path: publicPath,
      filename: filename
    })
  } catch (error) {
    console.error('Upload error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
