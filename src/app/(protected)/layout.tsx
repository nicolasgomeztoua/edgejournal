import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AccountProvider } from "@/contexts/account-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { api } from "@/trpc/server";
import { AppSidebar } from "./_components/app-sidebar";

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fetch initial theme from user settings
	const settings = await api.settings.get();
	const initialTheme = settings?.theme ?? "edgejournal";

	return (
		<ThemeProvider initialTheme={initialTheme}>
			<AccountProvider>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset className="bg-background">
						{/* Enhanced header */}
						<header className="relative flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-gradient-to-r from-white/[0.02] via-transparent to-white/[0.02] px-5">
							{/* Subtle grid pattern */}
							<div className="grid-bg pointer-events-none absolute inset-0 opacity-20" />
							{/* Top accent line */}
							<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
							<SidebarTrigger className="-ml-1 relative h-8 w-8 rounded-md border border-white/10 bg-white/[0.03] text-muted-foreground transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-foreground" />
							<Separator
								className="relative mx-2 h-5 bg-white/10"
								orientation="vertical"
							/>
							{/* Breadcrumb placeholder - can be enhanced later */}
							<div className="flex-1" />
						</header>
						<main className="relative flex-1 overflow-auto p-6">
							{/* Background grid for content area */}
							<div className="grid-bg pointer-events-none fixed inset-0 opacity-15" />
							{/* Gradient orbs for atmosphere */}
							<div className="pointer-events-none fixed -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[120px]" />
							<div className="pointer-events-none fixed -right-32 bottom-1/4 h-[300px] w-[300px] rounded-full bg-accent/[0.03] blur-[120px]" />
							<div className="relative">{children}</div>
						</main>
					</SidebarInset>
				</SidebarProvider>
			</AccountProvider>
		</ThemeProvider>
	);
}
