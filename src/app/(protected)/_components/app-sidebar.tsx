"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	BookOpen,
	Brain,
	Check,
	ChevronsUpDown,
	FileSpreadsheet,
	LayoutDashboard,
	Plus,
	PlusCircle,
	Settings,
	TrendingUp,
	Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAccount } from "@/contexts/account-context";
import { cn } from "@/lib/utils";

const mainNavItems = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Trades",
		href: "/journal",
		icon: BookOpen,
	},
	{
		title: "Analytics",
		href: "/analytics",
		icon: BarChart3,
	},
	{
		title: "AI Insights",
		href: "/ai",
		icon: Brain,
	},
];

// Removed - Import CSV is now part of Add Trade dropdown

const ACCOUNT_TYPE_COLORS = {
	live: "bg-green-500",
	demo: "bg-blue-500",
	paper: "bg-amber-500",
};

export function AppSidebar() {
	const pathname = usePathname();
	const { accounts, selectedAccount, setSelectedAccountId, isLoading } =
		useAccount();

	return (
		<Sidebar variant="floating">
			<SidebarHeader className="border-sidebar-border border-b">
				<Link className="flex items-center gap-2 px-2 py-2" href="/dashboard">
					<div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/15">
						<div className="-inset-px absolute rounded-lg landing-border opacity-80" />
						<TrendingUp className="relative h-5 w-5 text-primary-foreground" />
					</div>
					<span className="font-semibold text-[15px] tracking-tight">
						<span className="text-sidebar-foreground">Edge</span>
						<span className="text-primary">Journal</span>
					</span>
				</Link>

				{/* Account Selector */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className="flex w-full items-center gap-2 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent/70"
							type="button"
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/50" />
									<span className="text-muted-foreground">Loading...</span>
								</div>
							) : selectedAccount ? (
								<>
									<div
										className={cn(
											"h-2 w-2 rounded-full",
											ACCOUNT_TYPE_COLORS[selectedAccount.accountType],
										)}
									/>
									<div className="flex-1 truncate">
										<span className="font-medium">{selectedAccount.name}</span>
										{selectedAccount.broker && (
											<span className="ml-1 text-muted-foreground text-xs">
												({selectedAccount.broker})
											</span>
										)}
									</div>
									<ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
								</>
							) : (
								<>
									<Wallet className="h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground">No account</span>
									<ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
								</>
							)}
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-[220px]">
						{accounts.length === 0 ? (
							<DropdownMenuItem asChild>
								<Link
									className="flex items-center gap-2"
									href="/settings?tab=accounts"
								>
									<PlusCircle className="h-4 w-4" />
									Create your first account
								</Link>
							</DropdownMenuItem>
						) : (
							<>
								{accounts.map((account) => (
									<DropdownMenuItem
										className="flex items-center gap-2"
										key={account.id}
										onClick={() => setSelectedAccountId(account.id)}
									>
										<div
											className={cn(
												"h-2 w-2 rounded-full",
												ACCOUNT_TYPE_COLORS[account.accountType],
											)}
										/>
										<div className="flex-1 truncate">
											<span>{account.name}</span>
											{account.broker && (
												<span className="ml-1 text-muted-foreground text-xs">
													({account.broker})
												</span>
											)}
										</div>
										{selectedAccount?.id === account.id && (
											<Check className="h-4 w-4 text-primary" />
										)}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										className="flex items-center gap-2"
										href="/settings?tab=accounts"
									>
										<Settings className="h-4 w-4" />
										Manage accounts
									</Link>
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Add Trade Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="mt-2 w-full shadow-sm shadow-primary/15" size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Trade
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-[200px]">
						<DropdownMenuItem asChild>
							<Link className="flex items-center gap-2" href="/trade/new">
								<Plus className="h-4 w-4" />
								Log Trade
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link className="flex items-center gap-2" href="/import">
								<FileSpreadsheet className="h-4 w-4" />
								Import CSV
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={pathname === item.href}>
										<Link href={item.href}>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-sidebar-border border-t">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={pathname === "/settings"}>
							<Link href="/settings">
								<Settings className="h-4 w-4" />
								<span>Settings</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<div className="flex items-center gap-3 px-2 py-2">
							<UserButton
								afterSignOutUrl="/"
								appearance={{
									elements: {
										avatarBox: "h-8 w-8",
									},
								}}
							/>
							<span className="text-muted-foreground text-sm">Account</span>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
