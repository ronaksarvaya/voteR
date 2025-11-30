# Forgot Password 500 Error - Fix Summary

## Problem
Getting 500 error when requesting forgot password email on deployed version (Render backend).

## Root Causes Identified

1. **Email Configuration Missing**: `EMAIL_USER` and `EMAIL_PASS` environment variables might not be set in Render
2. **Frontend URL Detection**: Backend couldn't determine correct frontend URL for reset link
3. **Error Handling**: Poor error messages made debugging difficult

## Fixes Applied

### 1. Backend Error Handling (`backend/routes/auth.js`)

**Improved Error Handling:**
- Added detailed console logging at each step
- Check if email credentials are configured before attempting to send
- Separate try-catch for email sending to provide specific error messages
- Better error messages returned to frontend

**Frontend URL Detection:**
- Enhanced logic to detect frontend URL from multiple sources:
  1. `FRONTEND_URL` environment variable (preferred)
  2. Request `origin` header
  3. Request `referer` header (parsed properly)
  4. Fallback to `https://vote-r.vercel.app`

### 2. CORS Configuration (`backend/index.js`)

**Enhanced CORS:**
- Added explicit methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Added explicit allowed headers: `Content-Type`, `Authorization`, `Origin`
- Added alternative local port `5174`

## Deployment Steps Required

### Step 1: Set Environment Variables in Render

Go to your Render backend dashboard and add these environment variables:

```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://vote-r.vercel.app
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
```

**Important:** 
- `EMAIL_PASS` must be a Gmail App Password, not your regular password
- To get Gmail App Password:
  1. Go to Google Account → Security
  2. Enable 2-Factor Authentication
  3. Go to App Passwords
  4. Generate password for "Mail"
  5. Use that 16-character password

### Step 2: Redeploy Backend

After setting environment variables:
1. Commit and push the updated code to your repository
2. Render will automatically redeploy
3. Or manually trigger a deploy in Render dashboard

### Step 3: Test the Fix

Use the POSTMAN_TESTING_GUIDE.md to test:

```bash
# Test forgot password
curl -X POST https://voter-tx4v.onrender.com/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Origin: https://vote-r.vercel.app" \
  -d '{"email":"your_test_email@gmail.com"}'
```

**Expected Success Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

**Possible Error Responses:**

1. **Email Not Configured:**
```json
{
  "error": "Email service not configured. Please contact administrator."
}
```
**Solution:** Set `EMAIL_USER` and `EMAIL_PASS` in Render environment variables

2. **Email Send Failed:**
```json
{
  "error": "Failed to send reset email. Please check email configuration or try again later."
}
```
**Solution:** 
- Verify Gmail App Password is correct
- Check Gmail security settings
- Ensure 2FA is enabled

## Debugging

### Check Render Logs

1. Go to Render Dashboard
2. Select your backend service
3. Click "Logs" tab
4. Look for these log messages:

**Success:**
```
Password reset request for: user@example.com
Reset token saved to database
Reset URL generated: https://vote-r.vercel.app/reset-password/abc123...
Password reset email sent successfully to: user@example.com
```

**Failure:**
```
Password reset request for: user@example.com
Email credentials not configured
```
OR
```
Error sending email: [error details]
```

### Common Issues

#### Issue 1: "Email service not configured"
**Cause:** `EMAIL_USER` or `EMAIL_PASS` not set in Render
**Solution:** Add environment variables in Render dashboard

#### Issue 2: "Failed to send reset email"
**Cause:** Invalid Gmail App Password or Gmail security blocking
**Solution:** 
- Regenerate Gmail App Password
- Check "Less secure app access" is OFF (use App Password instead)
- Verify 2FA is enabled

#### Issue 3: Email sent but wrong URL
**Cause:** `FRONTEND_URL` not set
**Solution:** Set `FRONTEND_URL=https://vote-r.vercel.app` in Render

#### Issue 4: CORS error
**Cause:** Frontend origin not allowed
**Solution:** Already fixed in code - redeploy backend

## Testing Checklist

After deploying fixes:

- [ ] Backend environment variables are set in Render
- [ ] Backend is redeployed with latest code
- [ ] Test forgot password from frontend
- [ ] Check email is received
- [ ] Verify reset link has correct URL (not localhost)
- [ ] Click reset link and verify it works
- [ ] Reset password successfully
- [ ] Login with new password

## Files Modified

1. `backend/routes/auth.js` - Enhanced error handling and logging
2. `backend/index.js` - Improved CORS configuration
3. `POSTMAN_TESTING_GUIDE.md` - Testing instructions
4. `DEPLOYMENT_GUIDE.md` - Deployment instructions

## Next Steps

1. **Set environment variables in Render** (most important!)
2. **Redeploy backend**
3. **Test using Postman or frontend**
4. **Check Render logs** if issues persist
5. **Verify email is received** with correct reset link

## Support

If you still get 500 error after following these steps:

1. Check Render logs for specific error message
2. Verify all environment variables are set correctly
3. Test email credentials separately
4. Ensure MongoDB connection is working
5. Check if user email exists in database
