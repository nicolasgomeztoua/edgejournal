"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Pricing() {
  return (
    <section className="py-24" id="pricing">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start with our free trial. No credit card required.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <Card className="flex flex-col border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-border hover:bg-card">
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Perfect for beginners</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-bold text-4xl">$0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Up to 50 trades/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Basic Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>1 Portfolio</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex flex-col border-primary/50 bg-card/80 shadow-2xl shadow-primary/10 transition-all hover:border-primary">
            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle>Pro Trader</CardTitle>
              <CardDescription>For serious growth</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-bold text-4xl">$29</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited trades</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Advanced Analytics & Charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>AI Insights (500 credits/mo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited Portfolios</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Import from all brokers</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Start 14-Day Free Trial</Button>
            </CardFooter>
          </Card>

          {/* Elite Plan */}
          <Card className="flex flex-col border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-border hover:bg-card">
            <CardHeader>
              <CardTitle>Elite</CardTitle>
              <CardDescription>Maximum performance</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-bold text-4xl">$49</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited AI Insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>1-on-1 Onboarding</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
