import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const JoinSession = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Extract code from input (if it's a link, get the last part)
    let code = input.trim();
    if (code.includes("/")) {
      code = code.split("/").pop();
    }
    // TODO: Validate code with backend
    navigate(`/session/${code}`);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-foreground">Join a Voting Session</h2>
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sessionCode">Session Code or Link</Label>
              <Input
                id="sessionCode"
                value={input}
                onChange={e => setInput(e.target.value)}
                required
                placeholder="Enter session code or link"
              />
            </div>
            <Button
              className="w-full font-semibold shadow-lg"
              type="submit"
            >
              Join Session
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinSession;