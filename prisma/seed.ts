import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create sample services/workshops
  const services = await Promise.all([
    prisma.service.upsert({
      where: { slug: 'organic-gardening-basics' },
      update: {},
      create: {
        slug: 'organic-gardening-basics',
        title: 'Organic Gardening Basics',
        category: 'Beginner Workshop',
        description: 'Learn the fundamentals of organic gardening including soil preparation, composting, and natural pest control. Perfect for beginners with no prior gardening experience. All materials provided!',
        duration: '2 hours',
        price: 0,
        maxAttendees: 20,
        image: '/images/bg.jpeg',
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'seed-saving-techniques' },
      update: {},
      create: {
        slug: 'seed-saving-techniques',
        title: 'Seed Saving Techniques',
        category: 'Advanced Workshop',
        description: 'Master the art of seed saving to preserve heirloom varieties and ensure sustainable gardening practices. This workshop is ideal for gardeners with some experience who want to take their skills to the next level.',
        duration: '3 hours',
        price: 25,
        maxAttendees: 15,
        image: '/images/bg.jpeg',
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'urban-farming-101' },
      update: {},
      create: {
        slug: 'urban-farming-101',
        title: 'Urban Farming 101',
        category: 'Beginner Workshop',
        description: 'Discover how to grow food in small spaces, from balcony gardens to community plots. Learn container gardening, vertical growing, and space-efficient techniques.',
        duration: '2.5 hours',
        price: 0,
        maxAttendees: 25,
        image: '/images/bg.jpeg',
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'composting-workshop' },
      update: {},
      create: {
        slug: 'composting-workshop',
        title: 'Composting Workshop',
        category: 'All Levels',
        description: 'Learn how to turn kitchen scraps and yard waste into nutrient-rich compost for your garden. Discover the science behind composting and troubleshooting common issues.',
        duration: '1.5 hours',
        price: 15,
        maxAttendees: 30,
        image: '/images/bg.jpeg',
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'kids-garden-club' },
      update: {},
      create: {
        slug: 'kids-garden-club',
        title: 'Kids Garden Club',
        category: 'Kids Program',
        description: 'Fun, hands-on gardening activities for children ages 6-12. Learn about plants, insects, and nature through interactive games and projects!',
        duration: '1 hour weekly',
        price: 0,
        maxAttendees: 15,
        image: '/images/bg.jpeg',
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'permaculture-design' },
      update: {},
      create: {
        slug: 'permaculture-design',
        title: 'Permaculture Design',
        category: 'Advanced Workshop',
        description: 'Explore permaculture principles and design sustainable, self-maintaining garden ecosystems. Learn about zones, guilds, and regenerative agriculture.',
        duration: 'Full day',
        price: 50,
        maxAttendees: 12,
        image: '/images/bg.jpeg',
        active: true,
      },
    }),
  ])

  console.log(`Created ${services.length} services`)

  // Create sample schedules for some services
  const organicGardeningService = services[0]
  const schedules = await Promise.all([
    prisma.schedule.create({
      data: {
        serviceId: organicGardeningService.id,
        date: new Date('2025-03-15'),
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        availableSpots: 15,
      },
    }),
    prisma.schedule.create({
      data: {
        serviceId: organicGardeningService.id,
        date: new Date('2025-03-22'),
        startTime: '2:00 PM',
        endTime: '4:00 PM',
        availableSpots: 20,
      },
    }),
  ])

  console.log(`Created ${schedules.length} schedules`)

  // Create sample blog posts
  const blogPosts = await Promise.all([
    prisma.blogPost.upsert({
      where: { slug: 'spring-planting-guide' },
      update: {},
      create: {
        slug: 'spring-planting-guide',
        title: 'Your Complete Spring Planting Guide',
        excerpt: 'Discover the best vegetables and herbs to plant this spring, along with expert tips for a successful growing season.',
        author: 'Jane Smith',
        category: 'Gardening Tips',
        tags: ['spring', 'planting', 'vegetables'],
        image: '/images/bg.jpeg',
        published: true,
        publishedAt: new Date('2024-02-15'),
        content: `# Your Complete Spring Planting Guide

Spring is the most exciting time of year for gardeners! As the soil warms up and days get longer, it's time to start planning your spring garden.

## When to Start

The key to successful spring planting is timing. Start by understanding your last frost date - this varies by location but is crucial for planning.

### Cool-Season Crops
These can be planted 4-6 weeks before your last frost date:
- Lettuce
- Spinach
- Peas
- Radishes
- Carrots

### Warm-Season Crops
Wait until after your last frost date for:
- Tomatoes
- Peppers
- Cucumbers
- Squash
- Beans

## Soil Preparation

Good soil is the foundation of a successful garden. Here's what you need to do:

1. **Test your soil pH** - Most vegetables prefer pH 6.0-7.0
2. **Add organic matter** - Compost improves soil structure
3. **Till or turn** - Loosen compacted soil for root growth

## Planting Tips

- **Seed depth**: Plant seeds at a depth of 2-3 times their diameter
- **Spacing**: Follow packet instructions to prevent overcrowding
- **Watering**: Keep soil consistently moist but not waterlogged

Happy planting!`,
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'composting-basics' },
      update: {},
      create: {
        slug: 'composting-basics',
        title: 'Composting Basics: Turn Waste into Garden Gold',
        excerpt: 'Learn how to create nutrient-rich compost from kitchen scraps and yard waste with our comprehensive guide.',
        author: 'John Doe',
        category: 'Sustainability',
        tags: ['composting', 'sustainability', 'organic'],
        image: '/images/bg.jpeg',
        published: true,
        publishedAt: new Date('2024-02-10'),
        content: `# Composting Basics: Turn Waste into Garden Gold

Composting is one of the best things you can do for your garden and the environment. It reduces waste and creates nutrient-rich soil amendment.

## What Can You Compost?

### Green Materials (Nitrogen-rich):
- Fruit and vegetable scraps
- Coffee grounds and tea leaves
- Fresh grass clippings
- Plant trimmings

### Brown Materials (Carbon-rich):
- Dry leaves
- Shredded paper
- Cardboard
- Wood chips
- Straw

### Don't Compost:
- Meat, dairy, or oils
- Pet waste
- Diseased plants

## The Process

1. Choose a bin or create a pile
2. Layer green and brown materials
3. Keep it moist like a wrung-out sponge
4. Turn regularly for aeration
5. Wait 3-6 months for finished compost

Start composting today!`,
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'urban-gardening-tips' },
      update: {},
      create: {
        slug: 'urban-gardening-tips',
        title: '10 Tips for Successful Urban Gardening',
        excerpt: 'Maximize your small space with these proven strategies for growing food in the city.',
        author: 'Sarah Green',
        category: 'Urban Farming',
        tags: ['urban', 'small-space', 'balcony'],
        image: '/images/bg.jpeg',
        published: true,
        publishedAt: new Date('2024-02-05'),
        content: `# 10 Tips for Successful Urban Gardening

Growing food in the city comes with unique challenges, but with the right strategies, you can create a thriving urban garden.

## 1. Start Small
Don't overwhelm yourself. Begin with a few containers and expand as you gain confidence.

## 2. Choose the Right Containers
Ensure containers have drainage holes and are large enough for plant roots.

## 3. Maximize Vertical Space
Use trellises, wall planters, and hanging baskets to grow up instead of out.

## 4. Select Appropriate Plants
Choose compact varieties bred for container growing.

## 5. Optimize Light
Observe sun patterns and place plants accordingly.

Happy urban gardening!`,
      },
    }),
  ])

  console.log(`Created ${blogPosts.length} blog posts`)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
