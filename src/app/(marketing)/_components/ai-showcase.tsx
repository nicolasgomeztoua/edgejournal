"use client";

import { Brain, Send, Sparkles, Terminal, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const exampleQueries = [
  "Are my breakevens optimal?",
  "What's my best time to trade?",
  "Which setup has the highest RR?",
  "Analyze my psychology on losing days"
];

const fullResponse = `Based on your last 200 trades, I've analyzed your breakeven patterns:

• You move to breakeven on 34% of your winning trades.
• 47% of these trades would have hit your original take profit.
• This simple mistake is costing you approximately $127 per trade.

Recommendation: Consider a scaled exit approach. Secure 1R profit before moving stops to breakeven. Your win rate on trades you let run is 23% higher.`;

export function AIShowcase() {
  const [selectedQuery, setSelectedQuery] = useState(exampleQueries[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isTyping) {
      let i = 0;
      setDisplayedResponse("");
      const interval = setInterval(() => {
        setDisplayedResponse(fullResponse.slice(0, i));
        i++;
        if (i > fullResponse.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 15); // Fast typing speed
      return () => clearInterval(interval);
    }
  }, [isTyping]);

  const handleQuery = (query: string) => {
    setSelectedQuery(query);
    setHasStarted(true);
    setIsTyping(true);
  };

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" id="ai">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="container relative mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Side: Copy */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
              <Sparkles className="h-3 w-3" />
              <span>EdgeJournal Intelligence</span>
            </div>
            
            <h2 className="font-bold text-4xl tracking-tight sm:text-5xl mb-6">
              Your Personal <br />
              <span className="text-purple-400">Trading Mentor</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Stop guessing why you're losing. Our AI analyzes your journals, fills, and notes to find the patterns you can't see.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                  <Bot className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground"> unbiased Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-1">Get objective feedback on your strategy without emotional bias.</p>
                </div>
              </div>
               <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                  <Terminal className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Natural Language</h3>
                  <p className="text-sm text-muted-foreground mt-1">Just ask questions like you would to a mentor. No complex queries needed.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Demo */}
          <div className="relative">
             <Card className="relative z-10 overflow-hidden border-border/50 bg-background/80 shadow-2xl backdrop-blur-xl">
                {/* Chat Window Header */}
                <div className="flex items-center justify-between border-b border-border/40 bg-secondary/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <span className="ml-2 text-xs font-medium text-muted-foreground">AI Analyst</span>
                  </div>
                </div>

                {/* Chat Body */}
                <div className="flex h-[400px] flex-col justify-between p-4">
                  <div className="flex-1 overflow-y-auto space-y-4">
                     {/* Initial Greeting */}
                     <div className="flex gap-3">
                       <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-purple-400" />
                       </div>
                       <div className="bg-secondary/40 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-foreground max-w-[85%]">
                          Hello! I've analyzed your recent trading data. What would you like to know about your performance?
                       </div>
                     </div>

                     {/* User Query (if selected) */}
                     {hasStarted && (
                        <div className="flex justify-end animate-in slide-in-from-bottom-2 fade-in duration-300">
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[85%]">
                             {selectedQuery}
                          </div>
                        </div>
                     )}

                     {/* AI Response */}
                     {(hasStarted && (isTyping || displayedResponse)) && (
                        <div className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
                           <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                              <Bot className="h-4 w-4 text-purple-400" />
                           </div>
                           <div className="bg-secondary/40 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-foreground max-w-[90%]">
                              <div className="whitespace-pre-wrap leading-relaxed">
                                {displayedResponse}
                                {isTyping && <span className="inline-block w-1.5 h-3.5 ml-1 bg-purple-400 animate-pulse"/>}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Input Area (Mock) */}
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {!hasStarted && exampleQueries.map((q) => (
                        <button 
                          key={q}
                          onClick={() => handleQuery(q)}
                          className="text-xs border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary px-2 py-1 rounded-full transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input 
                        disabled 
                        placeholder={hasStarted ? "Ask a follow up..." : "Select a query above..."}
                        className="w-full bg-secondary/30 border border-border/40 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7">
                        <Send className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
             </Card>
             
             {/* Decorative blob behind card */}
             <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-20 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
