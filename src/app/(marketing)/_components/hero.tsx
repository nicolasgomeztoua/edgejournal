"use client";

import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDashboardMock } from "./hero-dashboard-mock";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden pt-24 pb-32">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent opacity-30" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Announcement Badge */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-6 gap-2 border-primary/20 bg-primary/5 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">v2.0 is here</span> — AI-Powered Analytics
              </span>
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards delay-150 font-sans font-bold text-5xl leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Find Your Edge in <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Every Market Condition
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-8 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards delay-300 text-lg text-muted-foreground sm:text-xl">
            The professional trading journal for futures and forex. 
            Analyze patterns, track psychology, and let AI discover what's holding you back.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex animate-in fade-in slide-in-from-bottom-6 flex-col gap-4 duration-700 fill-mode-backwards delay-500 sm:flex-row">
            <SignUpButton mode="modal">
              <Button size="lg" className="h-12 min-w-[160px] text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignUpButton>
            <Button size="lg" variant="outline" className="h-12 min-w-[160px] text-base hover:bg-secondary/50">
              <a href="#features">View Demo</a>
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 animate-in fade-in zoom-in-95 duration-1000 fill-mode-backwards delay-700">
          <HeroDashboardMock />
        </div>

        {/* Social Proof / Trust */}
        <div className="mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards delay-1000">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground/60">
            TRUSTED BY TRADERS FROM TOP FIRMS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
             {/* Simple text placeholders for logos as we don't have SVGs handy, or abstract shapes */}
             <div className="flex items-center gap-2 font-bold text-lg text-foreground"><div className="h-6 w-6 rounded bg-foreground" /> APEX</div>
             <div className="flex items-center gap-2 font-bold text-lg text-foreground"><div className="h-6 w-6 rounded bg-foreground" /> TOPSTEP</div>
             <div className="flex items-center gap-2 font-bold text-lg text-foreground"><div className="h-6 w-6 rounded bg-foreground" /> FTMO</div>
          </div>
        </div>
      </div>
    </section>
  );
}
