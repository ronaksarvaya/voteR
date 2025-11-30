# VoteR Deployment Guide

## Environment Variables Setup

### Backend Environment Variables (Required)

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (use a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL (Important for password reset emails)
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables (Optional)

Create a `.env` file in the `frontend` directory:

```env
# API URL (if different from default)
VITE_API_URL=https://your-backend-domain.vercel.app
```

## Vercel Deployment

### Backend Deployment

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `backend` directory as the root

3. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all the backend environment variables listed above
   - **Important**: Set `FRONTEND_URL` to your deployed frontend URL

4. **Deploy**
   - Vercel will automatically deploy your backend

### Frontend Deployment

1. **Update API URL**
   - In `frontend/src/config.js`, update the API_URL if needed
   - Or set `VITE_API_URL` environment variable in Vercel

2. **Import project to Vercel**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `frontend` directory as the root

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**
   - Vercel will automatically deploy your frontend

## Gmail App Password Setup

To send emails (for OTP and password reset), you need a Gmail App Password:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Use this password in the `EMAIL_PASS` environment variable

## Password Reset Fix

The forgot password functionality has been updated to automatically detect the frontend URL from the request origin. However, for best results:

1. **Set FRONTEND_URL in Vercel**:
   - Go to your backend project in Vercel
   - Settings → Environment Variables
   - Add: `FRONTEND_URL` = `https://your-frontend-domain.vercel.app`
   - Redeploy the backend

2. **The code now falls back to**:
   - `process.env.FRONTEND_URL` (if set)
   - Request origin header (automatically detected)
   - Request referer header (automatically detected)
   - `http://localhost:5173` (for local development)

## Testing Forgot Password

After deployment:

1. Go to your deployed frontend
2. Click "Forgot Password"
3. Enter your email
4. Check your email for the reset link
5. The link should point to your deployed frontend URL
6. Click the link and reset your password

## Common Issues

### Issue: Password reset email has wrong URL

**Solution**: Set the `FRONTEND_URL` environment variable in Vercel backend settings

### Issue: Email not sending

**Solution**: 
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Make sure you're using a Gmail App Password, not your regular password
- Check Gmail security settings

### Issue: "Invalid or expired reset token"

**Solution**: 
- Reset tokens expire after 1 hour
- Request a new password reset link
- Make sure the backend is properly deployed with the latest code

## Monitoring

- Check Vercel logs for any errors
- Backend logs: Vercel Dashboard → Your Project → Deployments → View Function Logs
- Frontend logs: Browser console

## Security Notes

1. Never commit `.env` files to Git
2. Use strong, random values for `JWT_SECRET`
3. Rotate secrets periodically
4. Use Gmail App Passwords, not regular passwords
5. Keep your MongoDB connection string secure

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test locally first before deploying
4. Check email spam folder for reset emails
