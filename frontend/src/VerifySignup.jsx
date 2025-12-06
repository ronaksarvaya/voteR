import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const VerifySignup = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Get email from location state or redirect if missing
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);

      // Focus last filled input or the next empty one
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/verify-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Verification failed");
      } else {
        // Success! Redirect to login
        toast.success("Email verified successfully! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setResending(true);

    try {
      const res = await fetch(`${API_URL}/auth/resend-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setTimeLeft(300);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
        toast.success("Verification code resent!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✉️</span>
          </div>
          <CardTitle className="text-3xl font-bold">Verify Email</CardTitle>
          <CardDescription>
            We've sent a verification code to <br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify}>
            <div className="flex justify-between gap-2 mb-6">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full font-semibold shadow-md mb-6"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            {canResend ? (
              <Button
                variant="link"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-primary font-semibold hover:text-primary/80 p-0 h-auto"
              >
                {resending ? "Sending..." : "Resend Code"}
              </Button>
            ) : (
              <p className="text-muted-foreground font-mono">
                Resend in {formatTime(timeLeft)}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-4">
          <Button
            variant="link"
            onClick={() => navigate("/signup")}
            className="text-muted-foreground hover:text-foreground transition"
          >
            ← Back to Signup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifySignup;
