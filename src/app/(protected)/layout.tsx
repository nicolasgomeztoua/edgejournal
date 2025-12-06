import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { AccountProvider } from "@/contexts/account-context";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AccountProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className="flex h-14 shrink-0 items-center gap-2 border-border/50 border-b px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
					</header>
					<main className="flex-1 overflow-auto p-6">{children}</main>
				</SidebarInset>
			</SidebarProvider>
		</AccountProvider>
	);
}

