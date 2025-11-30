# Environment Variables Setup Instructions

## For Local Development (backend/.env)

Create or update your `backend/.env` file with these variables:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/voter?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Port
PORT=5000
```

## How to Fill in the Values

### 1. MONGO_URI
Your MongoDB connection string. If you don't have one:
- Go to https://cloud.mongodb.com
- Create a cluster (free tier available)
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your database password
- Replace `<dbname>` with `voter`

### 2. JWT_SECRET
A long random string for signing JWT tokens. Generate one:
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 64

# Option 3: Just type a long random string
# Example: my_super_secret_key_12345_abcdefg_xyz_2024
```

### 3. EMAIL_USER
Your Gmail address for sending emails.

**To create a new Gmail:**
1. Go to https://accounts.google.com/signup
2. Create account (e.g., `voter.service.app@gmail.com`)
3. Complete verification

### 4. EMAIL_PASS
Gmail App Password (NOT your regular Gmail password).

**To generate App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification first
3. Go to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Name it "VoteR Backend"
6. Copy the 16-character password (remove spaces)
7. Example: `abcdefghijklmnop`

### 5. FRONTEND_URL
- **Local development**: `http://localhost:5173`
- **Production**: `https://vote-r.vercel.app`

### 6. PORT
- Default: `5000`
- Change if port 5000 is already in use

## Quick Setup Steps

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit the .env file:**
   - Open `backend/.env` in your text editor
   - Replace all placeholder values with your actual credentials

3. **Verify the setup:**
   ```bash
   # Start the backend
   cd backend
   npm install
   npm start
   
   # In another terminal, test the config endpoint
   curl http://localhost:5000/auth/check-config
   ```

   You should see:
   ```json
   {
     "emailConfigured": true,
     "emailUser": "Set (hidden)",
     "frontendUrl": "http://localhost:5173",
     "jwtSecret": "Set (hidden)",
     "mongoUri": "Set (hidden)"
   }
   ```

## For Production (Render)

Don't use `.env` file in production. Instead, set environment variables in Render dashboard:

1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to "Environment" tab
4. Add each variable:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `FRONTEND_URL` (set to `https://vote-r.vercel.app`)

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to Git
- `.env` is already in `.gitignore`
- Use different credentials for development and production
- Keep your App Password secure
- Regenerate App Password if compromised

## Testing

After setting up your `.env` file:

1. **Test MongoDB connection:**
   ```bash
   cd backend
   npm start
   ```
   Look for: "Connected to MongoDB"

2. **Test email configuration:**
   - Start the backend
   - Go to http://localhost:5173
   - Try "Forgot Password" feature
   - Check if email is received

3. **Test JWT:**
   - Try signing up and logging in
   - If successful, JWT is working

## Troubleshooting

### "Email service not configured"
- Check `EMAIL_USER` and `EMAIL_PASS` are set
- Verify App Password is correct (no spaces)
- Make sure 2FA is enabled on Gmail

### "Invalid login" error
- You're using regular Gmail password instead of App Password
- Generate a new App Password
- Remove all spaces from the password

### "Connection refused" to MongoDB
- Check `MONGO_URI` is correct
- Verify MongoDB cluster is running
- Check IP whitelist in MongoDB (allow all: 0.0.0.0/0)

### "JWT malformed" error
- Check `JWT_SECRET` is set
- Make sure it's a long string (at least 32 characters)

## Example .env File (with fake values)

```env
MONGO_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/voter?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
EMAIL_USER=voter.service.app@gmail.com
EMAIL_PASS=abcdefghijklmnop
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Replace all values with your actual credentials!

## Need Help?

Refer to:
- `GMAIL_SETUP_GUIDE.md` - For Gmail and App Password setup
- `DEPLOYMENT_GUIDE.md` - For production deployment
- `QUICK_FIX_GUIDE.md` - For troubleshooting
