import { Github, Twitter } from "lucide-react";
import Link from "next/link";

const footerLinks = {
	Product: [
		{ name: "Features", href: "#features" },
		{ name: "AI Insights", href: "#ai" },
		{ name: "Pricing", href: "#pricing" },
		{ name: "Changelog", href: "#" },
		{ name: "Roadmap", href: "#" },
	],
	Resources: [
		{ name: "Documentation", href: "#" },
		{ name: "API Reference", href: "#" },
		{ name: "Blog", href: "#" },
		{ name: "Community", href: "#" },
		{ name: "Support", href: "#" },
	],
	Company: [
		{ name: "About", href: "#" },
		{ name: "Careers", href: "#" },
		{ name: "Contact", href: "#" },
		{ name: "Privacy", href: "#" },
		{ name: "Terms", href: "#" },
	],
};

const socialLinks = [
	{ name: "Twitter", href: "#", icon: Twitter },
	{ name: "GitHub", href: "#", icon: Github },
];

export function Footer() {
	return (
		<footer className="relative border-white/[0.05] border-t bg-card/30">
			{/* Subtle gradient */}
			<div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

			<div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
				{/* Main footer content */}
				<div className="grid gap-12 py-12 sm:py-16 lg:grid-cols-6 lg:gap-8">
					{/* Brand column */}
					<div className="lg:col-span-2">
						<Link className="group flex items-center gap-2.5" href="/">
							<div className="relative flex h-9 w-9 items-center justify-center">
								<div className="absolute inset-0 rounded-lg bg-primary/20 blur-lg transition-all group-hover:bg-primary/30" />
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
						<p className="mt-4 max-w-xs text-muted-foreground text-sm leading-relaxed">
							The professional trading journal for futures and forex traders who
							are serious about finding their edge and improving performance.
						</p>

						{/* Social links */}
						<div className="mt-6 flex items-center gap-3">
							{socialLinks.map((link) => (
								<a
									className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02] text-muted-foreground transition-colors hover:border-white/10 hover:bg-white/5 hover:text-foreground"
									href={link.href}
									key={link.name}
								>
									<link.icon className="h-4 w-4" />
									<span className="sr-only">{link.name}</span>
								</a>
							))}
						</div>
					</div>

					{/* Link columns */}
					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category}>
							<h3 className="font-medium text-sm">{category}</h3>
							<ul className="mt-4 space-y-3">
								{links.map((link) => (
									<li key={link.name}>
										<Link
											className="text-muted-foreground text-sm transition-colors hover:text-foreground"
											href={link.href}
										>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom bar */}
				<div className="flex flex-col items-center justify-between gap-4 border-white/[0.05] border-t py-6 sm:flex-row">
					<p className="text-muted-foreground text-sm">
						© {new Date().getFullYear()} EdgeJournal. All rights reserved.
					</p>
					<div className="flex items-center gap-6 text-muted-foreground text-sm">
						<Link className="transition-colors hover:text-foreground" href="#">
							Privacy Policy
						</Link>
						<Link className="transition-colors hover:text-foreground" href="#">
							Terms of Service
						</Link>
						<Link className="transition-colors hover:text-foreground" href="#">
							Cookies
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
