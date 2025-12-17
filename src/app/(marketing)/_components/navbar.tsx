"use client";

import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
	return (
		<header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
				{/* Logo */}
				<Link className="group flex items-center gap-3" href="/">
					<div className="relative flex h-8 w-8 items-center justify-center">
						{/* Logo mark - stylized E */}
						<svg
							className="h-8 w-8"
							fill="none"
							viewBox="0 0 32 32"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								className="fill-primary"
								height="32"
								rx="2"
								width="32"
							/>
							<path
								className="fill-primary-foreground"
								d="M8 8h16v3H11v5h11v3H11v5h13v3H8V8z"
							/>
						</svg>
					</div>
					<span className="font-mono text-sm font-medium tracking-tight uppercase">
						Edge<span className="text-primary">Journal</span>
					</span>
				</Link>

				{/* Navigation */}
				<nav className="hidden items-center gap-8 md:flex">
					<Link
						className="font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
						href="#features"
					>
						Features
					</Link>
					<Link
						className="font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
						href="#ai"
					>
						AI
					</Link>
					<Link
						className="font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
						href="#pricing"
					>
						Pricing
					</Link>
				</nav>

				{/* Auth */}
				<div className="flex items-center gap-3">
					<SignedOut>
						<SignInButton mode="modal">
							<Button
								className="font-mono text-xs uppercase tracking-wider"
								size="sm"
								variant="ghost"
							>
								Login
							</Button>
						</SignInButton>
						<SignUpButton mode="modal">
							<Button
								className="font-mono text-xs uppercase tracking-wider"
								size="sm"
							>
								Get Started
							</Button>
						</SignUpButton>
					</SignedOut>
					<SignedIn>
						<Link href="/dashboard">
							<Button
								className="font-mono text-xs uppercase tracking-wider"
								size="sm"
								variant="ghost"
							>
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
