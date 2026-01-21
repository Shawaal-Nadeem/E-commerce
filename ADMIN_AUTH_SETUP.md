# Admin Authentication Setup

## Overview
The admin dashboard is now protected with authentication. Only authorized users with valid credentials can access the admin panel.

## Setup Instructions

### 1. Create Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Admin Authentication
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password

# Other existing environment variables...
NEXT_PUBLIC_SPACE_ID=your_contentful_space_id
NEXT_PUBLIC_CONTENT_DELIVERY_API=your_contentful_delivery_api_key
CONTENTFUL_MANAGEMENT_TOKEN=your_contentful_management_token
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 2. Set Secure Credentials

**⚠️ IMPORTANT:** Change the default credentials for production!

- `ADMIN_USERNAME`: Your admin username (default: `admin`)
- `ADMIN_PASSWORD`: Your admin password (default: `admin123`)

**Example:**
```env
ADMIN_USERNAME=myadmin
ADMIN_PASSWORD=MySecureP@ssw0rd123!
```

### 3. Restart Development Server

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

## How It Works

### Authentication Flow

1. **Login Page**: Users are redirected to `/admin/login` when trying to access `/admin`
2. **Credential Validation**: Username and password are validated against environment variables
3. **Session Cookie**: Upon successful login, a secure HTTP-only cookie is set
4. **Protected Routes**: The admin dashboard checks for valid authentication before rendering
5. **Logout**: Users can logout using the logout button in the top-right corner

### Security Features

- ✅ HTTP-only cookies (not accessible via JavaScript)
- ✅ Secure cookies in production (HTTPS only)
- ✅ 7-day session expiration
- ✅ Server-side authentication checks
- ✅ Automatic redirect for unauthenticated users

## Usage

### Accessing the Admin Dashboard

1. Navigate to `http://localhost:3000/admin`
2. You'll be redirected to the login page
3. Enter your credentials (set in `.env.local`)
4. Click "Sign In"
5. Upon successful authentication, you'll be redirected to the admin dashboard

### Logging Out

Click the "Logout" button in the top-right corner of the admin dashboard.

## File Structure

```
src/
├── auth/
│   ├── auth-actions.ts           # Server actions for login/logout
│   ├── admin-login-form.tsx      # Client-side login form component
│   └── admin-logout-button.tsx   # Client-side logout button
└── app/
    └── admin/
        ├── login/
        │   └── page.tsx          # Login page route
        └── page.tsx              # Protected admin dashboard
```

## Default Credentials

**For Development Only:**
- Username: `admin`
- Password: `admin123`

**⚠️ CHANGE THESE FOR PRODUCTION!**

## Troubleshooting

### Issue: Can't login
- Check that `.env.local` exists and contains `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Verify credentials match exactly (case-sensitive)
- Restart the development server after changing environment variables

### Issue: Redirected to login after successful authentication
- Clear browser cookies
- Check browser console for errors
- Verify cookies are being set (check Application > Cookies in DevTools)

## Future Enhancements

Consider implementing:
- Password hashing with bcrypt
- Database-backed user management
- Multiple admin users
- Role-based access control (RBAC)
- Two-factor authentication (2FA)
- Password reset functionality
- Session management dashboard
