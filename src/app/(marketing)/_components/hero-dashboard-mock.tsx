"use client";

import { BarChart3, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, MoreHorizontal, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroDashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-5xl perspective-1000">
      <div 
        className={cn(
          "relative rounded-xl border border-border/40 bg-card/90 shadow-2xl backdrop-blur-xl",
          "transform transition-all duration-700 hover:scale-[1.01]",
          "rotate-x-12 rotate-y-0 skew-x-0 skew-y-0" // subtle 3D feel if we want, or flat
        )}
        style={{
          transform: "perspective(1000px) rotateX(2deg) translateY(0)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Mock Window Header */}
        <div className="flex items-center gap-4 border-b border-border/40 px-6 py-4">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="flex h-8 w-64 items-center gap-2 rounded-md bg-secondary/50 px-3 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              <span>Search trades, setups, or symbols...</span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-secondary/50" />
        </div>

        {/* Mock Content */}
        <div className="grid grid-cols-12 gap-0">
          {/* Sidebar */}
          <div className="col-span-2 hidden flex-col gap-2 border-r border-border/40 p-4 md:flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-full rounded-md bg-secondary/30" />
            ))}
          </div>

          {/* Main Area */}
          <div className="col-span-12 flex flex-col gap-6 p-6 md:col-span-10">
            {/* Top Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Net P&L", value: "+$12,450.00", color: "text-profit", icon: Wallet },
                { label: "Win Rate", value: "68.5%", color: "text-primary", icon: TrendingUp },
                { label: "Profit Factor", value: "2.4", color: "text-foreground", icon: BarChart3 },
              ].map((stat, i) => (
                <div key={i} className="rounded-lg border border-border/40 bg-secondary/20 p-4">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className={cn("mt-2 font-mono text-2xl font-bold", stat.color)}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Area Mock */}
            <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border/40 bg-gradient-to-b from-secondary/10 to-transparent">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-0 pt-8">
                {[40, 65, 55, 80, 70, 90, 85, 95, 88, 75, 92, 98].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-full mx-1 rounded-t-sm bg-primary/20 hover:bg-primary/40 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              
              {/* Overlay Line */}
              <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Recent Trades Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Trades</h3>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                {[
                  { symbol: "ES", type: "Long", status: "Win", amount: "+$450.00" },
                  { symbol: "NQ", type: "Short", status: "Win", amount: "+$820.00" },
                  { symbol: "GC", type: "Long", status: "Loss", amount: "-$210.00" },
                ].map((trade, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border/40 bg-secondary/10 px-4 py-3 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{trade.symbol}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                        trade.type === "Long" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      )}>
                        {trade.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-mono font-medium", trade.status === "Win" ? "text-profit" : "text-loss")}>
                        {trade.amount}
                      </span>
                      {trade.status === "Win" ? 
                        <ArrowUpRight className="h-4 w-4 text-profit" /> : 
                        <ArrowDownRight className="h-4 w-4 text-loss" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
