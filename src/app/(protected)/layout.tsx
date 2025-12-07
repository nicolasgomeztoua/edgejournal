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
				<SidebarInset>
					<header className="flex h-14 shrink-0 items-center gap-2 border-border/50 border-b px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator className="mr-2 h-4" orientation="vertical" />
					</header>
					<main className="flex-1 overflow-auto p-6">{children}</main>
				</SidebarInset>
			</SidebarProvider>
		</AccountProvider>
	);
}
