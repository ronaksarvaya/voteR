import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResetLink("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok && !data.resetLink) {
        toast.error(data.error || "Failed to send reset email");
      } else {
        toast.success(data.message || "If an account exists with this email, you will receive a password reset link shortly.");
        if (data.resetLink) {
          setResetLink(data.resetLink);
        }
        setEmail("");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <CardTitle className="text-3xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>No worries! Enter your email and we'll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            {resetLink && (
              <div className="bg-secondary/20 border border-secondary p-4 rounded-lg mt-4">
                <p className="text-secondary-foreground text-sm mb-2 font-semibold">Your Password Reset Link:</p>
                <div className="bg-background p-2 rounded border border-border break-all text-xs font-mono text-muted-foreground mb-2">
                  {resetLink}
                </div>
                <Button
                  asChild
                  className="w-full font-semibold"
                >
                  <a href={resetLink}>Click to Reset Password</a>
                </Button>
              </div>
            )}

            <Button
              className="w-full font-semibold shadow-md"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Link...
                </>
              ) : (
                "Generate Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center flex-col space-y-2 pb-6">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <span
              className="text-primary font-semibold cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <span
              className="text-primary font-semibold cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
