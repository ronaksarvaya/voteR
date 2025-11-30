# Testing Forgot Password API with Postman

This guide will help you test the forgot password functionality using Postman.

## Prerequisites

- Postman installed (or use Postman Web)
- Your backend API URL (e.g., `https://your-backend.vercel.app`)
- A registered user email in your database

## Step-by-Step Testing Guide

### 1. Test Forgot Password Request

This endpoint sends a password reset email to the user.

**Endpoint:** `POST /auth/forgot-password`

**Request Setup:**
1. Open Postman
2. Create a new request
3. Set method to `POST`
4. Enter URL: `https://your-backend.vercel.app/auth/forgot-password`
5. Go to **Headers** tab:
   - Add header: `Content-Type` = `application/json`
   - Add header: `Origin` = `https://your-frontend.vercel.app` (your deployed frontend URL)
6. Go to **Body** tab:
   - Select `raw`
   - Select `JSON` from dropdown
   - Enter:
   ```json
   {
     "email": "test@example.com"
   }
   ```

**Expected Response (200 OK):**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

**What Happens:**
- Backend generates a reset token
- Stores token in database with 1-hour expiry
- Sends email with reset link to the user
- Reset link format: `https://your-frontend.vercel.app/reset-password/{token}`

**Check Your Email:**
- Open the email inbox for the test email
- You should receive an email with subject "VoteR - Password Reset Request"
- Copy the reset token from the URL (the long string after `/reset-password/`)

---

### 2. Test Verify Reset Token

This endpoint verifies if a reset token is valid.

**Endpoint:** `POST /auth/verify-reset-token`

**Request Setup:**
1. Create a new request
2. Set method to `POST`
3. Enter URL: `https://your-backend.vercel.app/auth/verify-reset-token`
4. Go to **Headers** tab:
   - Add header: `Content-Type` = `application/json`
5. Go to **Body** tab:
   - Select `raw`
   - Select `JSON`
   - Enter (replace with actual token from email):
   ```json
   {
     "token": "your_reset_token_here"
   }
   ```

**Expected Response (200 OK):**
```json
{
  "message": "Token is valid",
  "email": "test@example.com"
}
```

**Error Response (400 Bad Request) - Invalid/Expired Token:**
```json
{
  "error": "Invalid or expired reset token"
}
```

---

### 3. Test Reset Password

This endpoint actually resets the password.

**Endpoint:** `POST /auth/reset-password`

**Request Setup:**
1. Create a new request
2. Set method to `POST`
3. Enter URL: `https://your-backend.vercel.app/auth/reset-password`
4. Go to **Headers** tab:
   - Add header: `Content-Type` = `application/json`
5. Go to **Body** tab:
   - Select `raw`
   - Select `JSON`
   - Enter (replace with actual token and new password):
   ```json
   {
     "token": "your_reset_token_here",
     "newPassword": "NewPassword123!"
   }
   ```

**Expected Response (200 OK):**
```json
{
  "message": "Password reset successful. You can now log in with your new password."
}
```

**Error Responses:**

**400 Bad Request - Invalid Token:**
```json
{
  "error": "Invalid or expired reset token"
}
```

**400 Bad Request - Expired Token:**
```json
{
  "error": "Reset token has expired"
}
```

---

### 4. Test Login with New Password

Verify the password was actually changed.

**Endpoint:** `POST /auth/login`

**Request Setup:**
1. Create a new request
2. Set method to `POST`
3. Enter URL: `https://your-backend.vercel.app/auth/login`
4. Go to **Headers** tab:
   - Add header: `Content-Type` = `application/json`
5. Go to **Body** tab:
   - Select `raw`
   - Select `JSON`
   - Enter:
   ```json
   {
     "email": "test@example.com",
     "password": "NewPassword123!"
   }
   ```

**Expected Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Complete Test Flow

### Scenario 1: Successful Password Reset

1. **Request Reset:**
   ```
   POST /auth/forgot-password
   Body: { "email": "test@example.com" }
   Result: ✅ Email sent
   ```

2. **Check Email:**
   - Open email inbox
   - Copy reset token from URL

3. **Verify Token:**
   ```
   POST /auth/verify-reset-token
   Body: { "token": "abc123..." }
   Result: ✅ Token is valid
   ```

4. **Reset Password:**
   ```
   POST /auth/reset-password
   Body: { "token": "abc123...", "newPassword": "NewPass123!" }
   Result: ✅ Password reset successful
   ```

5. **Login with New Password:**
   ```
   POST /auth/login
   Body: { "email": "test@example.com", "password": "NewPass123!" }
   Result: ✅ Login successful
   ```

### Scenario 2: Expired Token

1. Request reset and wait 1+ hour
2. Try to use the token
3. Expected: "Reset token has expired" error

### Scenario 3: Invalid Token

1. Use a random/fake token
2. Expected: "Invalid or expired reset token" error

### Scenario 4: Non-existent Email

1. Request reset with email that doesn't exist
2. Expected: Still returns success (security feature - don't reveal if email exists)
3. No email is actually sent

---

## Postman Collection

You can create a Postman Collection with all these requests:

### Collection Structure:
```
VoteR API Tests
├── Auth
│   ├── 1. Forgot Password
│   ├── 2. Verify Reset Token
│   ├── 3. Reset Password
│   └── 4. Login with New Password
```

### Environment Variables

Create a Postman Environment with these variables:

```
BASE_URL = https://your-backend.vercel.app
FRONTEND_URL = https://your-frontend.vercel.app
TEST_EMAIL = test@example.com
RESET_TOKEN = (will be filled from email)
NEW_PASSWORD = NewPassword123!
```

Then use `{{BASE_URL}}` in your requests instead of hardcoding the URL.

---

## Troubleshooting

### Issue: "Failed to process password reset request"

**Possible Causes:**
- Email credentials not set in backend environment variables
- Gmail App Password incorrect
- Network/SMTP issues

**Solution:**
- Check backend logs in Vercel
- Verify `EMAIL_USER` and `EMAIL_PASS` environment variables
- Make sure using Gmail App Password, not regular password

### Issue: Reset link has wrong URL (localhost instead of deployed URL)

**Possible Causes:**
- `FRONTEND_URL` environment variable not set
- `Origin` header not sent in request

**Solution:**
- Set `FRONTEND_URL` in Vercel backend environment variables
- Add `Origin` header in Postman request
- Redeploy backend after setting environment variable

### Issue: "Invalid or expired reset token"

**Possible Causes:**
- Token expired (1 hour limit)
- Token already used
- Wrong token copied

**Solution:**
- Request a new reset token
- Make sure copying the complete token from email
- Test within 1 hour of requesting reset

---

## Testing Checklist

- [ ] Forgot password sends email successfully
- [ ] Email contains correct frontend URL (not localhost)
- [ ] Reset link in email is clickable
- [ ] Token verification works
- [ ] Password reset succeeds with valid token
- [ ] Cannot reuse the same token
- [ ] Token expires after 1 hour
- [ ] Can login with new password
- [ ] Cannot login with old password
- [ ] Security: Non-existent emails don't reveal user existence

---

## Advanced Testing

### Test with cURL

If you prefer command line:

```bash
# 1. Request password reset
curl -X POST https://your-backend.vercel.app/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-frontend.vercel.app" \
  -d '{"email":"test@example.com"}'

# 2. Verify token
curl -X POST https://your-backend.vercel.app/auth/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token":"your_token_here"}'

# 3. Reset password
curl -X POST https://your-backend.vercel.app/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"your_token_here","newPassword":"NewPass123!"}'

# 4. Login
curl -X POST https://your-backend.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"NewPass123!"}'
```

---

## Notes

1. **Security Feature:** The API returns the same success message whether the email exists or not. This prevents attackers from discovering valid email addresses.

2. **Token Expiry:** Reset tokens expire after 1 hour for security. Users must complete the reset within this time.

3. **One-Time Use:** Each reset token can only be used once. After successful password reset, the token is deleted from the database.

4. **Origin Header:** When testing in Postman, include the `Origin` header with your frontend URL so the backend can generate the correct reset link.

5. **Email Delivery:** Check spam folder if you don't receive the reset email immediately.
