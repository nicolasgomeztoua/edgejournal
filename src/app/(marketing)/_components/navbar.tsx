"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "border-b border-border/40 bg-background/80 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/40 transition-all group-hover:bg-primary group-hover:ring-primary">
            <TrendingUp className="h-5 w-5 text-primary transition-colors group-hover:text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">EdgeJournal</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            href="#ai"
          >
            AI Insights
          </Link>
          <Link
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            href="#pricing"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                Log In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm">
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="sm" variant="ghost">
                Dashboard
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
