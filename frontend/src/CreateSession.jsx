import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const CreateSession = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to create a session.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/session/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create session");
      } else {
        setSessionCode(data.code);
        setCreated(true);
        toast.success("Session created successfully!");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/vote/" + sessionCode);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-foreground">Create a New Voting Session</h2>
      {!created ? (
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Student Council Election"
                />
              </div>
              <Button
                className="w-full font-semibold shadow-lg"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Session"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold text-primary mb-2">Session Created Successfully!</h3>
              <p className="text-muted-foreground">Your voting session is ready to go</p>
            </div>

            {/* Next Steps */}
            <div className="bg-secondary/20 border-l-4 border-secondary p-6 mb-8 rounded-r-lg">
              <h4 className="font-bold text-secondary-foreground mb-4 flex items-center gap-2 text-lg">
                <span>📋</span> Next Steps:
              </h4>
              <ol className="list-decimal list-inside space-y-3 text-secondary-foreground/80">
                <li>Click the button below to go to your Admin Dashboard</li>
                <li>Add candidates for the voting session</li>
                <li>Share the participant link below with voters</li>
                <li>Monitor votes and view results in real-time</li>
              </ol>
            </div>

            {/* Admin Dashboard Button */}
            <Button
              onClick={() => navigate(`/session/${sessionCode}`)}
              className="w-full py-6 text-xl mb-8 shadow-lg gap-3"
            >
              <span>👑</span>
              Go to Admin Dashboard
              <span>→</span>
            </Button>

            {/* Share Section */}
            <div className="border-t border-border pt-8">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
                <span>📤</span> Share with Participants:
              </h4>

              <div className="mb-6 space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Participant Link:</Label>
                <div className="flex gap-2">
                  <Input
                    value={window.location.origin + "/vote/" + sessionCode}
                    readOnly
                    className="flex-1 text-sm"
                    onClick={(e) => e.target.select()}
                  />
                  <Button
                    onClick={copyLink}
                    variant="secondary"
                    className="font-semibold shadow-md"
                  >
                    📋 Copy
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  Or share this session code:
                  <span className="font-mono bg-background px-4 py-1 rounded border border-border font-bold text-primary text-lg tracking-wider">
                    {sessionCode}
                  </span>
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-primary/20 border border-primary rounded-lg p-4">
              <p className="text-sm text-primary">
                <span className="font-semibold">💡 Tip:</span> You can access your admin dashboard anytime from the home page by clicking on your session.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateSession;
