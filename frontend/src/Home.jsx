import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-6xl font-bold mb-4 text-primary">
            Welcome to VoteR
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Democracy made simple and accessible for everyone.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Create Session Card */}
          <Card className="hover:shadow-2xl hover:shadow-primary/10 transition duration-300 transform hover:-translate-y-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create Session</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Start a new voting session with custom options. Perfect for polls, surveys, and decision-making.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate("/create-session")}
                className="w-full py-6 text-lg font-semibold shadow-lg gap-2"
              >
                Create Voting Session
              </Button>
            </CardFooter>
          </Card>

          {/* Join Session Card */}
          <Card className="hover:shadow-2xl hover:shadow-secondary/10 transition duration-300 transform hover:-translate-y-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Join Session</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Enter a session code to participate in an active voting session and cast your vote.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => navigate("/join-session")}
                className="w-full py-6 text-primary border-2 border-primary hover:bg-primary/10 hover:text-primary text-lg font-semibold shadow-md hover:shadow-lg gap-2"
              >
                <span>🔗</span>
                Join Voting Session
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-10">
            Why Choose VoteR?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="hover:shadow-xl transition duration-300">
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <CardTitle className="text-xl font-bold">Real-Time Results</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  See voting results update instantly as participants cast their votes
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-xl transition duration-300">
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <CardTitle className="text-xl font-bold">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Your votes are encrypted and secure with our robust authentication system
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-xl transition duration-300">
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <CardTitle className="text-xl font-bold">Easy to Use</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Simple interface that anyone can use without technical knowledge
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <Card className="max-w-4xl mx-auto mt-16 shadow-xl">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">Fast</div>
                <p className="text-muted-foreground">Quick Setup</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">Secure</div>
                <p className="text-muted-foreground">Protected Votes</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">Simple</div>
                <p className="text-muted-foreground">Easy Interface</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default Home;
