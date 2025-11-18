# The Morning Family Garden - Next.js Setup Guide

## Project Overview
A dynamic Next.js web application for The Morning Family Garden community organization featuring:
- Blog system with Markdown support
- Dynamic services listing with workshop registration
- Volunteer registration system
- Stripe payment integration for donations
- User authentication with NextAuth
- Email/SMS notification system

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth
- **Payments**: Stripe
- **Notifications**: SendGrid (email), Twilio (SMS)

## Installation

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Stripe account (for payments)
- SendGrid API key (for emails)
- Twilio account (for SMS)

### Setup Steps

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tmfg_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

# Stripe
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SendGrid (Email)
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@tmfg.org"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# Admin Email
ADMIN_EMAIL="admin@tmfg.org"
```

3. **Set up Stripe**
   - Go to https://stripe.com and create an account
   - Navigate to Developers > API keys
   - Copy your Publishable key (pk_test_...) and Secret key (sk_test_...)
   - For webhooks: Developers > Webhooks > Add endpoint
   - Add endpoint: http://localhost:3000/api/webhooks/stripe
   - Select events: payment_intent.succeeded, payment_intent.payment_failed
   - Copy the webhook secret (whsec_...)

4. **Set up SendGrid**
   - Go to https://sendgrid.com and create account
   - Create an API key in Settings > API Keys
   - Verify a sender email address

5. **Set up Twilio**
   - Go to https://twilio.com and create account
   - Get your Account SID and Auth Token from dashboard
   - Buy a phone number for sending SMS

6. **Initialize Prisma database**
```bash
npm run db:push
npm run db:generate
```

7. **Run development server**
```bash
npm run dev
```

Visit http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
TMFG/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   ├── about/             # About page
│   │   ├── services/          # Services listing & individual pages
│   │   ├── blog/              # Blog with dynamic routes
│   │   ├── volunteer/         # Volunteer registration
│   │   ├── donate/            # Donation page
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth endpoints
│   │       ├── volunteers/    # Volunteer API
│   │       ├── services/      # Services API
│   │       ├── blog/          # Blog API
│   │       ├── donations/     # Stripe payment API
│   │       └── notifications/ # Email/SMS API
│   ├── components/            # React components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── lib/                   # Utility functions
│   │   ├── prisma.ts         # Prisma client
│   │   ├── stripe.ts         # Stripe client
│   │   └── notifications.ts  # Email/SMS helpers
│   └── styles/
│       └── globals.css        # Global styles
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── images/                # Static images
├── backend/                   # Legacy Express backend (will be migrated)
└── [config files]

```

## Features Implementation Status

✅ Next.js setup and configuration
✅ Basic layout with Navbar and Footer
✅ Home page with hero section
⏳ Blog system (next)
⏳ Services listing
⏳ Volunteer registration
⏳ Donation/Stripe integration
⏳ Authentication
⏳ Notifications
⏳ Database schema

## Next Steps

1. Implement Blog System
2. Create Services pages
3. Build Volunteer registration
4. Integrate Stripe payments
5. Set up authentication
6. Configure notifications
7. Migrate existing backend data

## Support

For issues or questions, contact: info@tmfg.org
