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
				<SidebarInset className="overflow-hidden">
					{/* App background */}
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
					<div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-grid-fine landing-mask-fade-y" />
					<div className="pointer-events-none absolute -top-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-primary/12 blur-[120px]" />

					<header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-border/60 border-b bg-background/60 px-4 backdrop-blur-xl">
						<SidebarTrigger className="-ml-1" />
						<Separator className="mr-2 h-4" orientation="vertical" />
					</header>

					<main className="relative flex-1 overflow-auto px-4 py-6 sm:px-6">
						<div className="mx-auto w-full max-w-6xl">{children}</div>
					</main>
				</SidebarInset>
			</SidebarProvider>
		</AccountProvider>
	);
}
