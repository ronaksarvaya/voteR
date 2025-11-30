# Quick Fix for 500 Error - Forgot Password

## The Problem

You're getting a 500 error because the email configuration environment variables are not set in your Render deployment.

## The Solution (3 Steps)

### Step 1: Set Environment Variables in Render

1. Go to https://dashboard.render.com
2. Click on your backend service (voter-tx4v)
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add these **4 required variables**:

| Key | Value | Notes |
|-----|-------|-------|
| `EMAIL_USER` | your_gmail@gmail.com | Your Gmail address |
| `EMAIL_PASS` | xxxx xxxx xxxx xxxx | Gmail App Password (16 chars) |
| `FRONTEND_URL` | https://vote-r.vercel.app | Your frontend URL |
| `JWT_SECRET` | (keep existing) | Should already be set |

### Step 2: Get Gmail App Password

If you don't have a Gmail App Password:

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App Passwords** (search for it in settings)
4. Select "Mail" and "Other (Custom name)"
5. Enter "VoteR Backend"
6. Click "Generate"
7. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)
8. Use this password in `EMAIL_PASS` (remove spaces)

### Step 3: Deploy Updated Code

1. **Commit and push the updated code** to your GitHub repository:
   ```bash
   git add .
   git commit -m "Fix forgot password with better error handling"
   git push
   ```

2. **Render will automatically redeploy** (or manually trigger in dashboard)

3. **Wait for deployment to complete** (check Render dashboard)

## Testing After Deployment

### Test 1: Try Forgot Password

1. Go to your frontend: https://vote-r.vercel.app
2. Click "Forgot Password"
3. Enter a registered email
4. Click "Send Reset Link"

**Expected Result:** Success message and email received

**If Still 500 Error:** Check Render logs (see below)

### Test 2: Check Render Logs

1. Go to Render Dashboard
2. Click your backend service
3. Click "Logs" tab
4. Look for error messages when you try forgot password

**What to look for:**

✅ **Success logs:**
```
Password reset request for: user@example.com
Reset token saved to database
Reset URL generated: https://vote-r.vercel.app/reset-password/...
Password reset email sent successfully to: user@example.com
```

❌ **Error logs:**
```
Email credentials not configured
```
→ **Solution:** Environment variables not set correctly

```
Error sending email: Invalid login
```
→ **Solution:** Wrong Gmail App Password

```
Error sending email: Username and Password not accepted
```
→ **Solution:** Need to use App Password, not regular password

## Common Issues

### Issue 1: "Cannot GET /auth/check-config"

**Cause:** Backend not redeployed with new code yet

**Solution:** Push code to GitHub and wait for Render to redeploy

### Issue 2: Still getting 500 after setting variables

**Cause:** Variables set but backend not restarted

**Solution:** 
1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

### Issue 3: Email not sending

**Possible causes:**
- Wrong Gmail App Password
- Using regular password instead of App Password
- 2FA not enabled on Gmail
- Gmail blocking the login

**Solution:**
1. Regenerate Gmail App Password
2. Make sure 2FA is enabled
3. Use App Password (16 chars), not regular password
4. Check Gmail security settings

### Issue 4: Email sent but wrong URL

**Cause:** `FRONTEND_URL` not set

**Solution:** Set `FRONTEND_URL=https://vote-r.vercel.app` in Render

## Verification Checklist

Before testing, verify:

- [ ] `EMAIL_USER` is set in Render environment variables
- [ ] `EMAIL_PASS` is set with Gmail App Password (not regular password)
- [ ] `FRONTEND_URL` is set to `https://vote-r.vercel.app`
- [ ] Code is pushed to GitHub
- [ ] Render has redeployed (check deployment status)
- [ ] Deployment shows "Live" status

## Quick Test Command

After deployment, test with curl:

```bash
curl -X POST https://voter-tx4v.onrender.com/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Origin: https://vote-r.vercel.app" \
  -d '{"email":"your_test_email@gmail.com"}'
```

**Expected response:**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

**Error response means:**
```json
{
  "error": "Email service not configured..."
}
```
→ Environment variables not set

## Still Not Working?

1. **Check Render Logs** - Most important step!
2. **Verify environment variables** are actually saved in Render
3. **Manually redeploy** from Render dashboard
4. **Test with a different email** to rule out user-specific issues
5. **Check spam folder** for reset email

## Summary

The 500 error is happening because:
1. Email credentials (`EMAIL_USER`, `EMAIL_PASS`) are not configured in Render
2. The backend code checks for these and returns 500 if missing

**The fix:**
1. Set environment variables in Render
2. Push updated code to GitHub
3. Wait for Render to redeploy
4. Test again

That's it! Once the environment variables are set and code is deployed, forgot password will work perfectly.
