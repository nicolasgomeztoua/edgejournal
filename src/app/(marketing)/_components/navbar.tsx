"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export function Navbar() {
	return (
		<header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<TrendingUp className="h-5 w-5 text-primary-foreground" />
					</div>
					<span className="text-xl font-bold tracking-tight">EdgeJournal</span>
				</Link>

				<nav className="hidden items-center gap-6 md:flex">
					<Link
						href="#features"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Features
					</Link>
					<Link
						href="#ai"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						AI Insights
					</Link>
					<Link
						href="#pricing"
						className="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						Pricing
					</Link>
				</nav>

				<div className="flex items-center gap-3">
					<SignedOut>
						<SignInButton mode="modal">
							<Button variant="ghost" size="sm">
								Sign In
							</Button>
						</SignInButton>
						<SignUpButton mode="modal">
							<Button size="sm">Get Started</Button>
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

