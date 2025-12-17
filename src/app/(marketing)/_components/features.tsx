"use client";

import {
  BarChart3,
  Brain,
  FileSpreadsheet,
  LineChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI-Powered Analysis",
    description: "Get personalized insights on your trading behavior. Our AI identifies your most profitable setups and hidden leaks.",
    icon: Brain,
    className: "col-span-1 lg:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
    iconColor: "text-primary",
  },
  {
    title: "Advanced Charting",
    description: "Visualize your equity curve with professional-grade charts.",
    icon: LineChart,
    className: "col-span-1",
    iconColor: "text-blue-400",
  },
  {
    title: "Risk Management",
    description: "Track R-multiples and position sizing automatically.",
    icon: Shield,
    className: "col-span-1",
    iconColor: "text-green-400",
  },
  {
    title: "Journal Everything",
    description: "Log emotions, mistakes, and market conditions for every trade.",
    icon: FileSpreadsheet,
    className: "col-span-1 lg:col-span-2",
    iconColor: "text-purple-400",
  },
  {
    title: "Instant Import",
    description: "Sync with MT4, MT5, NinjaTrader, and more via CSV.",
    icon: Zap,
    className: "col-span-1",
    iconColor: "text-yellow-400",
  },
];

export function Features() {
  return (
    <section className="relative py-24 sm:py-32" id="features">
      <div className="container mx-auto px-4">
        <div className="mb-16 max-w-2xl">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Built for the <span className="text-primary">Obsessive</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We've packed EdgeJournal with everything you need to dissect your trading performance and find consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 transition-all hover:border-border hover:shadow-lg",
                feature.className
              )}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/50">
                <feature.icon className={cn("h-5 w-5", feature.iconColor)} />
              </div>
              <h3 className="mb-2 font-semibold text-xl tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* Stats Section embedded in features */}
        <div className="mt-20 rounded-3xl border border-border/50 bg-card/30 p-8 md:p-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-bold text-foreground">1M+</div>
              <div className="mt-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">Trades Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">$500M+</div>
              <div className="mt-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">Volume Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground">24/7</div>
              <div className="mt-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">AI Availability</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
