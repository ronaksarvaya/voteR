# Implementation TODO List

## Backend Changes
- [x] Update `backend/routes/auth.js` - Add optional OTP verification
- [x] Update `backend/routes/auth.js` - Add forgot password endpoint
- [x] Update `backend/routes/auth.js` - Add reset password endpoint
- [x] Update `backend/routes/auth.js` - Add verify reset token endpoint
- [x] Update `backend/routes/auth.js` - Add resend OTP endpoint

## Frontend Changes
- [x] Update `frontend/src/Signup.jsx` - Add skip verification option + UI improvements
- [x] Update `frontend/src/VerifySignup.jsx` - Add resend OTP + UI improvements
- [x] Update `frontend/src/Login.jsx` - Add forgot password link + UI improvements
- [x] Create `frontend/src/ForgotPassword.jsx` - New component for password reset request
- [x] Create `frontend/src/ResetPassword.jsx` - New component for setting new password
- [x] Update `frontend/src/App.jsx` - Add new routes for password reset

## Testing
- [ ] Test signup with skip verification
- [ ] Test signup with OTP verification
- [ ] Test password reset flow
- [ ] Test resend OTP functionality
- [ ] Verify all UI improvements
