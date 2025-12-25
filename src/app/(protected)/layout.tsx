import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AccountProvider } from "@/contexts/account-context";
import { AppSidebar } from "./_components/app-sidebar";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AccountProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className="bg-background">
					<header className="relative flex h-12 shrink-0 items-center gap-2 border-white/5 border-b bg-black/20 px-4">
						{/* Subtle grid pattern */}
						<div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
						<SidebarTrigger className="-ml-1 relative text-muted-foreground hover:text-foreground" />
						<Separator
							className="relative mr-2 h-4 bg-white/10"
							orientation="vertical"
						/>
					</header>
					<main className="relative flex-1 overflow-auto p-6">
						{/* Background grid for content area */}
						<div className="grid-bg pointer-events-none fixed inset-0 opacity-20" />
						<div className="relative">{children}</div>
					</main>
				</SidebarInset>
			</SidebarProvider>
		</AccountProvider>
	);
}
