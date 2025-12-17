"use client";

import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navLinks = [
		{ name: "Features", href: "#features" },
		{ name: "AI Insights", href: "#ai" },
		{ name: "Pricing", href: "#pricing" },
	];

	return (
		<header
			className={`fixed top-0 z-50 w-full transition-all duration-500 ${
				isScrolled
					? "border-white/[0.05] border-b bg-background/60 backdrop-blur-2xl"
					: "bg-transparent"
			}`}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between lg:h-20">
					{/* Logo */}
					<Link className="group flex items-center gap-2.5" href="/">
						<div className="relative flex h-9 w-9 items-center justify-center">
							{/* Glow effect */}
							<div className="absolute inset-0 rounded-lg bg-primary/20 blur-lg transition-all group-hover:bg-primary/30" />
							{/* Logo mark */}
							<div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
								<svg
									aria-hidden="true"
									className="h-5 w-5 text-primary-foreground"
									fill="none"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									viewBox="0 0 24 24"
								>
									<path d="M3 3v18h18" />
									<path d="m19 9-5 5-4-4-3 3" />
								</svg>
							</div>
						</div>
						<span className="font-semibold text-lg tracking-tight">
							Edge<span className="text-primary">Journal</span>
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden items-center gap-1 lg:flex">
						{navLinks.map((link) => (
							<Link
								className="relative px-4 py-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
								href={link.href}
								key={link.name}
							>
								{link.name}
							</Link>
						))}
					</nav>

					{/* Desktop Auth Buttons */}
					<div className="hidden items-center gap-3 lg:flex">
						<SignedOut>
							<SignInButton mode="modal">
								<Button
									className="text-muted-foreground hover:text-foreground"
									size="sm"
									variant="ghost"
								>
									Sign In
								</Button>
							</SignInButton>
							<SignUpButton mode="modal">
								<Button className="bg-primary/90 hover:bg-primary" size="sm">
									Start Free
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

					{/* Mobile Menu Button */}
					<button
						className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground lg:hidden"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						type="button"
					>
						{isMobileMenuOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="border-white/[0.05] border-t pt-4 pb-6 lg:hidden">
						<nav className="flex flex-col gap-1">
							{navLinks.map((link) => (
								<Link
									className="rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
									href={link.href}
									key={link.name}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{link.name}
								</Link>
							))}
						</nav>
						<div className="mt-4 flex flex-col gap-2 px-4">
							<SignedOut>
								<SignInButton mode="modal">
									<Button className="w-full justify-center" variant="outline">
										Sign In
									</Button>
								</SignInButton>
								<SignUpButton mode="modal">
									<Button className="w-full justify-center">Start Free</Button>
								</SignUpButton>
							</SignedOut>
							<SignedIn>
								<Link href="/dashboard">
									<Button className="w-full justify-center">Dashboard</Button>
								</Link>
							</SignedIn>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
