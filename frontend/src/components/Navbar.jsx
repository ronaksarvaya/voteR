import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <span className="text-3xl font-bold text-primary">VoteR</span>
                </div>

                <div className="flex items-center gap-4">
                    <ModeToggle />

                    {location.pathname !== "/my-sessions" && (
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/my-sessions")}
                            className="gap-2 hidden md:flex"
                        >
                            <span>📂</span>
                            My Sessions
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="gap-2"
                    >
                        <span>🚪</span>
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
