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

export function Navbar() {
	return (
		<header className="fixed top-0 z-50 w-full border-border/40 border-b bg-background/80 backdrop-blur-xl">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<Link className="flex items-center gap-2" href="/">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<TrendingUp className="h-5 w-5 text-primary-foreground" />
					</div>
					<span className="font-bold text-xl tracking-tight">EdgeJournal</span>
				</Link>

				<nav className="hidden items-center gap-6 md:flex">
					<Link
						className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						href="#features"
					>
						Features
					</Link>
					<Link
						className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						href="#ai"
					>
						AI Insights
					</Link>
					<Link
						className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						href="#pricing"
					>
						Pricing
					</Link>
				</nav>

				<div className="flex items-center gap-3">
					<SignedOut>
						<SignInButton mode="modal">
							<Button size="sm" variant="ghost">
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
