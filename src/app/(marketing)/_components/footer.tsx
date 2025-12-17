import { TrendingUp } from "lucide-react";
import Link from "next/link";

const footerLinks = {
	Product: [
		{ name: "Features", href: "#features" },
		{ name: "AI Insights", href: "#ai" },
		{ name: "Pricing", href: "#pricing" },
		{ name: "Changelog", href: "#" },
	],
	Resources: [
		{ name: "Documentation", href: "#" },
		{ name: "API Reference", href: "#" },
		{ name: "Blog", href: "#" },
		{ name: "Community", href: "#" },
	],
	Company: [
		{ name: "About", href: "#" },
		{ name: "Contact", href: "#" },
		{ name: "Privacy", href: "#" },
		{ name: "Terms", href: "#" },
	],
};

export function Footer() {
	return (
		<footer className="relative border-border/60 border-t bg-card/20">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-card/25 to-background/0" />
			<div className="container mx-auto px-4 py-12">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
					{/* Brand column */}
					<div className="lg:col-span-2">
						<Link className="flex items-center gap-2" href="/">
							<div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/15">
								<div className="-inset-px absolute rounded-lg landing-border opacity-80" />
								<TrendingUp className="relative h-5 w-5 text-primary-foreground" />
							</div>
							<span className="font-semibold text-lg tracking-tight">
								Edge<span className="text-primary">Journal</span>
							</span>
						</Link>
						<p className="mt-4 max-w-xs text-muted-foreground text-sm">
							A trading journal that treats your process like a system. Track,
							analyze, and iterate—without losing the human context.
						</p>

						<div className="mt-5 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
							<span className="rounded-md border border-border/60 bg-card/30 px-2 py-1">
								Futures
							</span>
							<span className="rounded-md border border-border/60 bg-card/30 px-2 py-1">
								Forex
							</span>
							<span className="rounded-md border border-border/60 bg-card/30 px-2 py-1">
								BYOK AI
							</span>
						</div>
					</div>

					{/* Link columns */}
					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category}>
							<h3 className="font-semibold">{category}</h3>
							<ul className="mt-4 space-y-2">
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
				<div className="mt-12 flex flex-col items-center justify-between gap-4 border-border/50 border-t pt-8 sm:flex-row">
					<p className="text-muted-foreground text-sm">
						© {new Date().getFullYear()} EdgeJournal. All rights reserved.
					</p>
					<div className="flex items-center gap-4">
						<Link
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							href="#"
						>
							Twitter
						</Link>
						<Link
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							href="#"
						>
							Discord
						</Link>
						<Link
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
							href="#"
						>
							GitHub
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
