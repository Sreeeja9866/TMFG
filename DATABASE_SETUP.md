# PostgreSQL Database Setup Guide

## 📊 **Database Structure**

Your project needs these tables:
- ✅ **User** - Authentication (NextAuth)
- ✅ **Account** - OAuth accounts (NextAuth)
- ✅ **Session** - User sessions (NextAuth)
- ✅ **VerificationToken** - Email verification (NextAuth)
- ✅ **BlogPost** - Blog articles with images
- ✅ **Service** - Workshops/services with images
- ✅ **Schedule** - Workshop schedules
- ✅ **Registration** - Workshop registrations
- ✅ **Volunteer** - Volunteer applications
- ✅ **Donation** - Payment records
- ✅ **Newsletter** - Email subscribers

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Create PostgreSQL Database**

#### **Option A: Using pgAdmin (GUI)**

1. Open **pgAdmin** (should be installed with PostgreSQL)
2. Right-click on "Databases"
3. Click "Create" → "Database"
4. Enter database name: `tmfg_db`
5. Click "Save"

#### **Option B: Using Command Line**

Open Command Prompt or PowerShell and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tmfg_db;

# Verify it was created
\l

# Exit
\q
```

---

### **Step 2: Update Database Connection**

Your `.env` file should already have:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tmfg_db"
```

**Modify if needed:**
- Replace `postgres` (first one) with your PostgreSQL username
- Replace `postgres` (second one) with your PostgreSQL password
- Replace `5432` if using a different port
- Replace `tmfg_db` if you named it differently

**To find your PostgreSQL credentials:**
- Username is usually: `postgres`
- Password: What you set during PostgreSQL installation
- Port: Usually `5432`

---

### **Step 3: Create All Tables**

We'll use Prisma to automatically create all tables from the schema.

#### **Run Database Migration**

Open terminal in your project folder and run:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push
```

**What this does:**
- Creates all 11 tables
- Sets up relationships (foreign keys)
- Adds indexes
- Configures constraints

**Expected Output:**
```
✔ Generated Prisma Client
Your database is now in sync with your Prisma schema
```

---

### **Step 4: Verify Tables Were Created**

#### **Option A: Using pgAdmin**

1. Open pgAdmin
2. Navigate to: Databases → tmfg_db → Schemas → public → Tables
3. You should see all tables:
   - User
   - Account
   - Session
   - VerificationToken
   - BlogPost
   - Service
   - Schedule
   - Registration
   - Volunteer
   - Donation
   - Newsletter

#### **Option B: Using Command Line**

```bash
psql -U postgres -d tmfg_db

# List all tables
\dt

# Describe a specific table
\d "BlogPost"
\d "Service"

# Exit
\q
```

---

### **Step 5: Seed Initial Data**

Populate the database with sample data:

```bash
npm run db:seed
```

**This creates:**
- 6 sample services/workshops
- 2 workshop schedules
- 3 sample blog posts

---

## 📸 **Image Storage Strategy**

### **Chosen Approach: File System Storage**

**Why NOT base64:**
- ❌ Database bloat (base64 is ~33% larger)
- ❌ Slower queries
- ❌ Memory intensive
- ❌ Can't use CDN easily

**Why File System:**
- ✅ Better performance
- ✅ Smaller database size
- ✅ Easy to serve via Next.js
- ✅ Can add CDN later
- ✅ Industry standard

### **How It Works:**

1. **Upload:** User selects image
2. **Save:** Image saved to `/public/images/uploads/`
3. **Database:** Only the path stored (e.g., `/images/uploads/workshop-123.jpg`)
4. **Display:** Next.js Image component loads from public folder

### **File Structure:**
```
public/
  images/
    uploads/
      services/          # Workshop images
        organic-gardening.jpg
        seed-saving.jpg
      blog/              # Blog post images
        spring-planting.jpg
        composting.jpg
      temp/              # Temporary uploads (cleaned up)
```

---

## 🗃️ **Database Schema Details**

### **BlogPost Table**
```sql
- id: String (Primary Key)
- title: String
- slug: String (Unique)
- content: String (Markdown)
- excerpt: String (Optional)
- author: String
- category: String (Optional)
- tags: String[] (Array)
- image: String (Optional) ← Image path stored here
- published: Boolean
- publishedAt: DateTime (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

### **Service Table**
```sql
- id: String (Primary Key)
- title: String
- slug: String (Unique)
- description: String
- category: String
- duration: String (Optional)
- price: Float (Optional)
- maxAttendees: Int (Optional)
- image: String (Optional) ← Image path stored here
- active: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### **Volunteer Table**
```sql
- id: String (Primary Key)
- name: String
- email: String
- phone: String (Optional)
- availability: String
- interests: String[] (Array)
- experience: String (Optional)
- message: String (Optional)
- status: String (Default: 'pending')
- notificationSent: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### **Donation Table**
```sql
- id: String (Primary Key)
- amount: Float
- currency: String (Default: 'usd')
- donorName: String (Optional)
- donorEmail: String
- stripePaymentId: String (Unique)
- status: String
- message: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
```

### **Registration Table**
```sql
- id: String (Primary Key)
- serviceId: String (Foreign Key)
- scheduleId: String (Foreign Key, Optional)
- name: String
- email: String
- phone: String (Optional)
- message: String (Optional)
- status: String (Default: 'pending')
- createdAt: DateTime
- updatedAt: DateTime
```

### **Newsletter Table**
```sql
- id: String (Primary Key)
- email: String (Unique)
- active: Boolean (Default: true)
- createdAt: DateTime
```

---

## 🔧 **Common Commands**

### **Prisma Commands**
```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema to database (creates/updates tables)
npm run db:push

# Open Prisma Studio (visual database editor)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### **PostgreSQL Commands**
```bash
# Connect to database
psql -U postgres -d tmfg_db

# List all databases
\l

# List all tables
\dt

# View table structure
\d "TableName"

# Count records in table
SELECT COUNT(*) FROM "BlogPost";
SELECT COUNT(*) FROM "Service";
SELECT COUNT(*) FROM "Volunteer";

# View recent records
SELECT * FROM "Volunteer" ORDER BY "createdAt" DESC LIMIT 5;

# Clear all data from a table (keep structure)
TRUNCATE TABLE "Volunteer" CASCADE;

# Exit
\q
```

---

## 🎯 **Quick Start Checklist**

- [ ] PostgreSQL installed and running
- [ ] Database `tmfg_db` created
- [ ] `.env` file has correct DATABASE_URL
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:push` (creates tables)
- [ ] Run `npm run db:seed` (adds sample data)
- [ ] Verify tables exist (pgAdmin or psql)
- [ ] Test application: `npm run dev`

---

## 🐛 **Troubleshooting**

### **Error: "Can't reach database server"**
**Solution:**
1. Make sure PostgreSQL is running
   - Windows: Check Services → PostgreSQL should be "Running"
   - Or open pgAdmin to start it
2. Verify port 5432 is correct
3. Check username/password in DATABASE_URL

### **Error: "Database doesn't exist"**
**Solution:**
1. Create database: `CREATE DATABASE tmfg_db;`
2. Or create via pgAdmin

### **Error: "Password authentication failed"**
**Solution:**
1. Update DATABASE_URL with correct password
2. Password is case-sensitive
3. Use quotes if password has special characters:
   `postgresql://postgres:"my!pass"@localhost:5432/tmfg_db`

### **Error: "Relation does not exist"**
**Solution:**
1. Tables not created yet
2. Run: `npm run db:push`

### **Tables are empty**
**Solution:**
1. Run seed script: `npm run db:seed`
2. Or add data via admin panel

---

## 📊 **Viewing Your Data**

### **Option 1: Prisma Studio (Recommended)**
```bash
npm run db:studio
```
- Opens browser at http://localhost:5555
- Visual interface for all tables
- Can add/edit/delete records
- Very user-friendly!

### **Option 2: pgAdmin**
- Navigate to database → Tables
- Right-click table → View/Edit Data
- Can run SQL queries

### **Option 3: Command Line**
```bash
psql -U postgres -d tmfg_db

SELECT * FROM "Service";
SELECT * FROM "BlogPost";
SELECT * FROM "Volunteer";
```

---

## 🚀 **Production Deployment**

When deploying to production:

### **Recommended Database Hosts:**
1. **Supabase** (Free tier available)
   - PostgreSQL hosted
   - Auto backups
   - Easy setup

2. **Neon** (Free tier available)
   - Serverless PostgreSQL
   - Scales to zero
   - Fast cold starts

3. **Railway** (Free tier available)
   - PostgreSQL + hosting
   - One-click deploy

4. **Heroku Postgres** (Free tier limited)
   - Reliable
   - Easy to use

### **Migration for Production:**
```bash
# Export data from local
pg_dump -U postgres tmfg_db > backup.sql

# Import to production (get URL from hosting provider)
psql -d [production_database_url] < backup.sql
```

---

## 💡 **Next Steps**

After database setup:

1. ✅ **Test the application**
   ```bash
   npm run dev
   ```

2. ✅ **Check admin panel**
   - Visit: http://localhost:3000/admin
   - Should see seeded data

3. ✅ **Verify data**
   - Open Prisma Studio: `npm run db:studio`
   - Check each table has data

4. ✅ **Test forms**
   - Register for a workshop
   - Subscribe to newsletter
   - Submit volunteer application

---

**Your database is now ready to use!** 🎉

All tables are created and ready to store:
- ✅ Blog posts with images
- ✅ Services/workshops with images
- ✅ Volunteer applications
- ✅ Workshop registrations
- ✅ Donations
- ✅ Newsletter subscribers
- ✅ User authentication
