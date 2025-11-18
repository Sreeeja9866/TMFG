# Authentication Setup Guide

Complete guide for setting up email verification and Google SSO authentication for TMFG.

---

## ✅ What's Already Set Up

1. ✅ NextAuth installed and configured
2. ✅ Email provider with magic link authentication
3. ✅ Google OAuth provider
4. ✅ Modern signin page at `/auth/signin`
5. ✅ Prisma adapter for database storage
6. ✅ Automatic user creation on first signin

---

## 🎯 How It Works

### **First Time Signup:**

**Option 1: Email Magic Link**
1. User enters email at `/auth/signin`
2. System sends magic link to email
3. User clicks link to verify email
4. Account automatically created in database
5. User is signed in

**Option 2: Google SSO**
1. User clicks "Continue with Google"
2. Google authentication popup
3. User approves access
4. Account automatically created in database
5. User is signed in

### **Returning Users:**
- Same signin process
- System recognizes existing account
- User is signed in immediately

---

## 🔧 Setup Instructions

### Step 1: Configure Email Provider (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - Enable it

2. **Generate App Password**
   - Google Account → Security
   - App Passwords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Enter: "TMFG Website"
   - Click Generate
   - Copy the 16-character password

3. **Update `.env` file**:
   ```env
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-gmail@gmail.com"
   EMAIL_SERVER_PASSWORD="xxxx xxxx xxxx xxxx"  # Your app password
   EMAIL_FROM="noreply@tmfg.org"
   ```

---

### Step 2: Configure Google OAuth

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a Project** (if needed)
   - Click "Select a project" → "New Project"
   - Name: "TMFG"
   - Click "Create"

3. **Enable Google+ API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "TMFG Web"

5. **Configure Authorized URLs**
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)

   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

6. **Copy Credentials**
   - Copy Client ID
   - Copy Client Secret

7. **Update `.env` file**:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

---

### Step 3: Test Authentication

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test Email Authentication**:
   - Go to `http://localhost:3000/auth/signin`
   - Enter your email
   - Click "Sign in with Email"
   - Check your email for magic link
   - Click the link
   - You should be signed in!

3. **Test Google SSO**:
   - Go to `http://localhost:3000/auth/signin`
   - Click "Continue with Google"
   - Select your Google account
   - Approve access
   - You should be signed in!

4. **Check Database**:
   - User should be created in `User` table
   - Email should be verified
   - Account details stored

---

## 📊 Database Schema

The authentication system uses these Prisma models:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  phone         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  // ... other fields
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  // ... other fields
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

---

## 🔒 Security Features

### Email Magic Links:
- ✅ Tokens expire after 24 hours
- ✅ One-time use only
- ✅ Secure token generation
- ✅ Email verification required

### Google OAuth:
- ✅ Official Google authentication
- ✅ No password storage needed
- ✅ Automatic email verification
- ✅ Secure OAuth 2.0 flow

### Sessions:
- ✅ JWT-based sessions
- ✅ Secure session tokens
- ✅ Automatic expiration
- ✅ Database-backed session storage

---

## 🧪 Testing Checklist

- [ ] Email magic link sends successfully
- [ ] Magic link redirects to correct page
- [ ] User created in database on first signin
- [ ] Google SSO popup appears
- [ ] Google SSO creates user in database
- [ ] Returning users can sign in
- [ ] Email is verified after signin
- [ ] Session persists across page reloads

---

## 🐛 Troubleshooting

### Issue: Magic link email not sending

**Check:**
1. Gmail app password is correct (16 characters)
2. `EMAIL_SERVER_USER` is your full Gmail address
3. `EMAIL_SERVER_HOST` is "smtp.gmail.com"
4. `EMAIL_SERVER_PORT` is 587
5. Check spam folder for email
6. Check terminal for error messages

**Solution:**
```bash
# Test email configuration
# Check terminal for detailed error messages
```

### Issue: Google SSO not working

**Check:**
1. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Authorized redirect URI includes callback URL
3. Google+ API is enabled
4. Using correct Google Cloud project

**Solution:**
- Verify redirect URI: `http://localhost:3000/api/auth/callback/google`
- Clear browser cache
- Try incognito mode

### Issue: "Configuration error"

**Check:**
1. `NEXTAUTH_SECRET` is set in `.env`
2. `NEXTAUTH_URL` is correct (`http://localhost:3000`)
3. All required environment variables are set
4. Restart dev server after changing `.env`

---

## 📱 User Flow Examples

### New User - Email:
```
1. Visit /auth/signin
2. Enter: john@example.com
3. Click "Sign in with Email"
4. See "Check Your Email" message
5. Open email inbox
6. Click magic link in email
7. Redirected to /admin
8. ✅ Account created & signed in
```

### New User - Google:
```
1. Visit /auth/signin
2. Click "Continue with Google"
3. Google popup appears
4. Select Google account
5. Click "Allow"
6. Redirected to /admin
7. ✅ Account created & signed in
```

### Returning User:
```
1. Visit /auth/signin
2. Enter email OR click Google
3. Verify/authenticate
4. ✅ Signed in (existing account)
```

---

## 🔑 Environment Variables

Your `.env` file should have:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tmfg_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="lGsBJIBz7xnQJKVmv5uZ+CmORY+PGWEcAL6Y7KwiELE="

# Email Provider (Gmail)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-gmail@gmail.com"  # UPDATE
EMAIL_SERVER_PASSWORD="your-app-password"  # UPDATE
EMAIL_FROM="noreply@tmfg.org"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"  # UPDATE
GOOGLE_CLIENT_SECRET="your-client-secret"  # UPDATE
```

---

## 📚 Resources

### NextAuth Documentation:
- [Official Docs](https://next-auth.js.org/)
- [Email Provider](https://next-auth.js.org/providers/email)
- [Google Provider](https://next-auth.js.org/providers/google)
- [Prisma Adapter](https://next-auth.js.org/adapters/prisma)

### Google Cloud:
- [Console](https://console.cloud.google.com/)
- [OAuth Setup Guide](https://support.google.com/cloud/answer/6158849)

### Gmail App Passwords:
- [Create App Password](https://support.google.com/accounts/answer/185833)

---

## ✨ Features

### For Users:
- ✅ **No password needed** - Magic links or Google SSO
- ✅ **Instant signup** - Account created automatically
- ✅ **Secure** - Industry-standard authentication
- ✅ **Easy** - One-click signin with Google
- ✅ **Email verified** - Automatic verification

### For You:
- ✅ **No password management** - No passwords to store or hash
- ✅ **Auto user creation** - First signin creates account
- ✅ **Database storage** - All users stored in Prisma
- ✅ **Session management** - NextAuth handles everything
- ✅ **Type-safe** - Full TypeScript support

---

## 🎉 Summary

**Authentication is ready!** Users can:

1. **Sign in with Email** → Receive magic link → Account created
2. **Sign in with Google** → OAuth popup → Account created

**All user data stored in your PostgreSQL database**

**Next steps:**
1. Configure Gmail app password
2. Set up Google OAuth credentials
3. Update `.env` file
4. Test both signin methods
5. Deploy to production

---

**Last Updated**: 2025
**Version**: 1.0
