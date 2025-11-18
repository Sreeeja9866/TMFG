# Admin Panel Setup Guide

## 🎉 Admin Panel Created!

Your admin panel is now ready at `/admin`. Here's everything you need to know:

---

## 📍 **Admin Panel URL**

**Local Development:**
```
http://localhost:3000/admin
```

**Production:**
```
https://yourwebsite.com/admin
```

---

## 🔐 **Setting Up Admin Access**

### Step 1: Add Your Email as Admin

1. Open `src/lib/admin/auth.ts`
2. Add your email to the `ADMIN_EMAILS` array:

```typescript
const ADMIN_EMAILS = [
  'admin@tmfg.org',
  'your-email@example.com',  // Add your email here
]
```

### Step 2: Sign In

1. Go to `/auth/signin`
2. Sign in with your email (the one you added to ADMIN_EMAILS)
3. Check your email for the login link
4. Click the link to authenticate

### Step 3: Access Admin Panel

1. Once signed in, go to `/admin`
2. You should see the admin dashboard!

---

## 📊 **Admin Panel Features**

### **1. Dashboard (`/admin`)**
- Overview of all stats
- Quick metrics:
  - Active Services
  - Published Blog Posts
  - Total Volunteers (with pending count)
  - Total Registrations (with pending count)
  - Total Donations amount
  - Newsletter Subscribers
- Quick action buttons

### **2. Volunteers (`/admin/volunteers`)**
**What you can see:**
- All volunteer applications
- Filter by status: All, Pending, Approved, Declined
- View details:
  - Name and contact info
  - Availability (weekends, weekdays, flexible)
  - Interests (gardening, teaching, events, etc.)
  - Application date
  - Current status

**What you can do:**
- Review applications
- See volunteer experience and messages
- Track approval status

### **3. Workshop Registrations (`/admin/registrations`)**
**What you can see:**
- All workshop registrations
- Filter by status: All, Pending, Confirmed, Cancelled
- View details:
  - Participant name
  - Workshop name and category
  - Scheduled date and time
  - Contact information
  - Registration date
  - Status

**What you can do:**
- Track who registered for workshops
- See upcoming workshop attendance
- Monitor registration status

### **4. Donations (`/admin/donations`)**
**What you can see:**
- Complete donation history
- Stats cards showing:
  - Total donations amount
  - Number of successful donations
  - Status breakdown (succeeded/pending/failed)
  - Average donation amount
- Detailed table with:
  - Donation date and time
  - Donor name (or Anonymous)
  - Email address
  - Amount and currency
  - Payment status
  - Stripe payment ID
  - Donor message

**What you can do:**
- Track all donations
- Export for accounting
- Thank donors
- Verify payment status

### **5. Newsletter (`/admin/newsletter`)**
**What you can see:**
- All email subscribers
- Stats:
  - Total subscribers
  - Active subscribers
  - Unsubscribed count
- Each subscriber's:
  - Email address
  - Status (Active/Unsubscribed)
  - Subscription date

**What you can do:**
- View all subscribers
- Copy all active emails (for email campaigns)
- Track subscription growth

---

## 🚀 **Common Admin Tasks**

### **Reviewing New Volunteers**

1. Go to `/admin/volunteers?status=pending`
2. Click "View Details" on any application
3. Review their information
4. Update status (via API or future feature)

### **Checking Workshop Registrations**

1. Go to `/admin/registrations`
2. Filter by workshop or date
3. See who's registered
4. Contact participants if needed

### **Monitoring Donations**

1. Go to `/admin/donations`
2. View total amount raised
3. See recent donations
4. Export for records

### **Managing Newsletter**

1. Go to `/admin/newsletter`
2. Click "Copy All Active Emails"
3. Use in your email service (MailChimp, SendGrid, etc.)

---

## 🔒 **Security Features**

### **Built-in Protection:**

1. **Authentication Required**
   - Must be signed in to access `/admin`
   - Uses NextAuth for secure sessions

2. **Admin-Only Access**
   - Only emails in ADMIN_EMAILS list can access
   - Non-admin users redirected to home page

3. **No Search Engine Indexing**
   - Admin pages have `robots: noindex`
   - Won't appear in Google search

4. **Session-Based**
   - No passwords stored
   - Email-based login links
   - Automatic session expiry

---

## ⚙️ **Configuration**

### **Adding More Admins**

Edit `src/lib/admin/auth.ts`:

```typescript
const ADMIN_EMAILS = [
  'admin@tmfg.org',
  'director@tmfg.org',
  'coordinator@tmfg.org',
]
```

### **For Production (Recommended)**

Store admin emails in environment variables:

1. Update `.env.local` (or production env):
```
ADMIN_EMAILS="admin@tmfg.org,director@tmfg.org"
```

2. Update `src/lib/admin/auth.ts`:
```typescript
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []
```

---

## 📱 **Responsive Design**

The admin panel works on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones

Navigation automatically adapts to screen size.

---

## 🎯 **Future Enhancements (Recommended)**

### **Phase 1: Status Updates**
- Add buttons to approve/decline volunteers
- Add buttons to confirm/cancel registrations
- Email notifications on status changes

### **Phase 2: Content Management**
- Add/Edit/Delete Services (workshops)
- Add/Edit/Delete Blog Posts
- Schedule management

### **Phase 3: Advanced Features**
- Export data to CSV/Excel
- Send bulk emails to newsletter subscribers
- Analytics dashboard with charts
- Search and filter improvements

---

## 🆘 **Troubleshooting**

### **Can't Access Admin Panel**

**Problem:** Redirected to home page
**Solution:**
1. Make sure you're signed in (`/auth/signin`)
2. Verify your email is in ADMIN_EMAILS list
3. Try signing out and back in

**Problem:** "Unauthorized" error
**Solution:**
1. Your email must exactly match ADMIN_EMAILS
2. Check for typos in email address
3. Restart dev server after changing ADMIN_EMAILS

### **Don't Receive Sign-in Email**

**Problem:** No email arrives
**Solution:**
1. Check spam folder
2. Verify email configuration in NextAuth
3. For development, check terminal for magic link
4. Set up SendGrid for reliable email delivery

### **Data Not Showing**

**Problem:** Tables are empty
**Solution:**
1. Run the seed script: `npm run db:seed`
2. Check database connection
3. Make sure data exists in database

---

## 📊 **Sample Admin Workflow**

### **Daily Tasks:**
1. Check `/admin` for overview
2. Review pending volunteers
3. Check new workshop registrations
4. Monitor donations

### **Weekly Tasks:**
1. Review all volunteer applications
2. Confirm upcoming workshop participants
3. Thank recent donors
4. Export newsletter list

### **Monthly Tasks:**
1. Generate donation reports
2. Review registration trends
3. Plan new content based on interests

---

## 🔗 **Quick Links**

- **Dashboard:** `/admin`
- **Volunteers:** `/admin/volunteers`
- **Registrations:** `/admin/registrations`
- **Donations:** `/admin/donations`
- **Newsletter:** `/admin/newsletter`
- **Sign In:** `/auth/signin`
- **View Public Site:** `/`

---

## 💡 **Pro Tips**

1. **Bookmark Admin Dashboard:** Add `/admin` to your browser bookmarks
2. **Multiple Tabs:** Open different admin sections in separate tabs
3. **Keyboard Shortcuts:** Use browser back/forward for navigation
4. **Export Regularly:** Copy newsletter emails and donation data for backup
5. **Mobile Access:** Use tablet/phone for quick checks on the go

---

## 📧 **Getting Help**

If you need help with the admin panel:

1. Check this guide first
2. Review the code in `/src/app/admin/`
3. Check browser console for errors
4. Verify database connection

---

**Your admin panel is ready to use! Sign in and start managing your community garden. 🌱**
