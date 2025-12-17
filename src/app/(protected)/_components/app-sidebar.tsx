"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	BookOpen,
	Brain,
	Calendar,
	Check,
	ChevronsUpDown,
	FileSpreadsheet,
	LayoutDashboard,
	NotebookPen,
	Plus,
	PlusCircle,
	Settings,
	TrendingDown,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/contexts/account-context";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";

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
		title: "Calendar",
		href: "/calendar",
		icon: Calendar,
	},
	{
		title: "Analytics",
		href: "/analytics",
		icon: BarChart3,
	},
	{
		title: "Playbook",
		href: "/playbook",
		icon: NotebookPen,
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

function QuickStats() {
	const { selectedAccountId } = useAccount();
	const { data: stats, isLoading } = api.trades.getStats.useQuery({
		accountId: selectedAccountId ?? undefined,
	});

	if (isLoading) {
		return (
			<div className="space-y-3 rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3">
				<Skeleton className="h-4 w-16" />
				<div className="space-y-2">
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
		);
	}

	if (!stats || stats.totalTrades === 0) {
		return null;
	}

	return (
		<div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3">
			<p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
				Quick Stats
			</p>
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-xs">Total P&L</span>
					<span
						className={cn(
							"font-bold font-mono text-sm",
							stats.totalPnl >= 0 ? "text-profit" : "text-loss",
						)}
					>
						{stats.totalPnl >= 0 ? (
							<TrendingUp className="mr-1 inline h-3 w-3" />
						) : (
							<TrendingDown className="mr-1 inline h-3 w-3" />
						)}
						{formatCurrency(stats.totalPnl)}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-xs">Win Rate</span>
					<span
						className={cn(
							"font-mono text-sm",
							stats.winRate >= 50 ? "text-profit" : "text-loss",
						)}
					>
						{stats.winRate.toFixed(1)}%
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-xs">Trades</span>
					<span className="font-mono text-muted-foreground text-sm">
						{stats.totalTrades}
					</span>
				</div>
			</div>
		</div>
	);
}

export function AppSidebar() {
	const pathname = usePathname();
	const { accounts, selectedAccount, setSelectedAccountId, isLoading } =
		useAccount();

	return (
		<Sidebar>
			<SidebarHeader className="border-sidebar-border border-b">
				<Link className="flex items-center gap-2 px-2 py-2" href="/dashboard">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
						<TrendingUp className="h-5 w-5 text-primary-foreground" />
					</div>
					<span className="font-bold text-lg tracking-tight">EdgeJournal</span>
				</Link>

				{/* Account Selector */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent"
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
						<Button className="mt-2 w-full" size="sm">
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

				{/* Quick Stats */}
				<SidebarGroup>
					<SidebarGroupContent className="px-2">
						<QuickStats />
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
