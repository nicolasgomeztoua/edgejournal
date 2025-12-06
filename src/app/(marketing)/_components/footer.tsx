import Link from "next/link";
import { TrendingUp } from "lucide-react";

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
		<footer className="border-border/50 border-t bg-card/30">
			<div className="container mx-auto px-4 py-12">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
					{/* Brand column */}
					<div className="lg:col-span-2">
						<Link href="/" className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<TrendingUp className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="font-bold text-xl tracking-tight">
								EdgeJournal
							</span>
						</Link>
						<p className="mt-4 max-w-xs text-muted-foreground text-sm">
							The professional trading journal for futures and forex traders
							who want to find their edge.
						</p>
					</div>

					{/* Link columns */}
					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category}>
							<h3 className="font-semibold">{category}</h3>
							<ul className="mt-4 space-y-2">
								{links.map((link) => (
									<li key={link.name}>
										<Link
											href={link.href}
											className="text-muted-foreground text-sm transition-colors hover:text-foreground"
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
							href="#"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							Twitter
						</Link>
						<Link
							href="#"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							Discord
						</Link>
						<Link
							href="#"
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							GitHub
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

