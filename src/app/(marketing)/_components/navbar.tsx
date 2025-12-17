"use client";

import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/nextjs";
import { Menu, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

const links = [
	{ label: "Features", href: "#features" },
	{ label: "AI", href: "#ai" },
	{ label: "Pricing", href: "#pricing" },
];

export function Navbar() {
	return (
		<header className="fixed top-0 z-50 w-full">
			<div className="absolute inset-0 border-border/60 border-b bg-background/70 backdrop-blur-xl" />
			<div className="absolute inset-x-0 bottom-0 h-px w-full opacity-70 [background:linear-gradient(to_right,transparent,rgba(16,185,129,0.55),transparent)]" />

			<div className="container relative mx-auto flex h-16 items-center justify-between px-4">
				<Link className="flex items-center gap-2" href="/">
					<div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
						<div className="-inset-px landing-border absolute rounded-lg opacity-80" />
						<TrendingUp className="relative h-5 w-5 text-primary-foreground" />
					</div>
					<span className="font-semibold text-[15px] tracking-tight">
						<span className="text-foreground">Edge</span>
						<span className="text-primary">Journal</span>
					</span>
				</Link>

				<nav className="hidden items-center gap-6 md:flex">
					{links.map((link) => (
						<Link
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							href={link.href}
							key={link.href}
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-3">
					<SignedOut>
						<SignInButton mode="modal">
							<Button size="sm" variant="ghost">
								Sign In
							</Button>
						</SignInButton>
						<SignUpButton mode="modal">
							<Button className="shadow-primary/20 shadow-sm" size="sm">
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

					<div className="md:hidden">
						<Sheet>
							<SheetTrigger asChild>
								<Button aria-label="Open menu" size="icon-sm" variant="outline">
									<Menu className="h-4 w-4" />
								</Button>
							</SheetTrigger>
							<SheetContent className="p-0" side="right">
								<SheetHeader className="border-border/60 border-b">
									<SheetTitle className="flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
											<TrendingUp className="h-5 w-5 text-primary-foreground" />
										</div>
										<span className="font-semibold tracking-tight">
											Edge<span className="text-primary">Journal</span>
										</span>
									</SheetTitle>
								</SheetHeader>

								<div className="flex flex-col gap-2 p-4">
									{links.map((link) => (
										<Button asChild key={link.href} variant="ghost">
											<Link href={link.href}>{link.label}</Link>
										</Button>
									))}
								</div>

								<div className="border-border/60 border-t p-4">
									<SignedOut>
										<div className="grid gap-2">
											<SignInButton mode="modal">
												<Button variant="outline">Sign In</Button>
											</SignInButton>
											<SignUpButton mode="modal">
												<Button>Get Started</Button>
											</SignUpButton>
										</div>
									</SignedOut>
									<SignedIn>
										<div className="grid gap-2">
											<Button asChild variant="outline">
												<Link href="/dashboard">Go to Dashboard</Link>
											</Button>
											<div className="flex items-center justify-between">
												<span className="text-muted-foreground text-sm">
													Account
												</span>
												<UserButton afterSignOutUrl="/" />
											</div>
										</div>
									</SignedIn>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	);
}
