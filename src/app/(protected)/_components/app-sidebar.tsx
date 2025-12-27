"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	BookMarked,
	BookOpen,
	Brain,
	Check,
	ChevronsUpDown,
	FileSpreadsheet,
	FolderOpen,
	LayoutDashboard,
	Plus,
	PlusCircle,
	Settings,
	Wallet,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSelector } from "@/components/theme-selector";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
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
		title: "Playbooks",
		href: "/playbooks",
		icon: BookMarked,
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

// Updated account type colors for new types
const ACCOUNT_TYPE_COLORS: Record<string, string> = {
	prop_challenge: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
	prop_funded: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]",
	live: "bg-profit shadow-[0_0_6px_rgba(0,255,136,0.5)]",
	demo: "bg-accent shadow-[0_0_6px_rgba(0,212,255,0.5)]",
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
	prop_challenge: "Challenge",
	prop_funded: "Funded",
	live: "Live",
	demo: "Demo",
};

export function AppSidebar() {
	const pathname = usePathname();
	const { accounts, selectedAccount, setSelectedAccountId, isLoading } =
		useAccount();

	// Fetch groups for group selector
	const { data: groups = [] } = api.accounts.getGroups.useQuery();

	// Group accounts by their group
	const groupedAccounts = accounts.reduce(
		(acc, account) => {
			const groupId = account.groupId ?? "ungrouped";
			if (!acc[groupId]) {
				acc[groupId] = [];
			}
			acc[groupId].push(account);
			return acc;
		},
		{} as Record<string | number, typeof accounts>,
	);

	return (
		<Sidebar className="border-white/10">
			<SidebarHeader className="border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
				{/* Logo */}
				<Link className="flex items-center gap-3 px-2 py-3 group" href="/dashboard">
					<div className="relative">
						<svg
							aria-labelledby="sidebar-logo-title"
							className="h-9 w-9 transition-transform group-hover:scale-105"
							fill="none"
							role="img"
							viewBox="0 0 32 32"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title id="sidebar-logo-title">EdgeJournal Logo</title>
							<rect className="fill-primary" height="32" rx="4" width="32" />
							<path
								className="fill-primary-foreground"
								d="M8 8h16v3H11v5h11v3H11v5h13v3H8V8z"
							/>
						</svg>
						<div className="absolute -inset-1 rounded-lg bg-primary/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
					</div>
					<span className="font-medium font-mono text-sm uppercase tracking-tight">
						Edge<span className="text-primary">Journal</span>
					</span>
				</Link>

				{/* Account Selector */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left font-mono text-xs transition-all hover:border-white/20 hover:bg-white/[0.05]"
							type="button"
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted-foreground/50" />
									<span className="text-muted-foreground uppercase tracking-wider">
										Loading...
									</span>
								</div>
							) : selectedAccount ? (
								<>
									<div
										className={cn(
											"h-2.5 w-2.5 rounded-full",
											ACCOUNT_TYPE_COLORS[selectedAccount.accountType],
										)}
									/>
									<div className="flex-1 truncate">
										<span className="font-medium uppercase tracking-wider">
											{selectedAccount.name}
										</span>
										{selectedAccount.accountType.startsWith("prop_") && (
											<span className="ml-1.5 text-muted-foreground/70">
												({ACCOUNT_TYPE_LABELS[selectedAccount.accountType]})
											</span>
										)}
									</div>
									<ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
								</>
							) : (
								<>
									<Wallet className="h-3.5 w-3.5 text-muted-foreground" />
									<span className="text-muted-foreground uppercase tracking-wider">
										No account
									</span>
									<ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
								</>
							)}
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-[260px]">
						{accounts.length === 0 ? (
							<DropdownMenuItem asChild>
								<Link
									className="flex items-center gap-2 font-mono text-xs"
									href="/settings?tab=accounts"
								>
									<PlusCircle className="h-4 w-4" />
									Create your first account
								</Link>
							</DropdownMenuItem>
						) : (
							<>
								{/* Groups with accounts */}
								{groups.map((group) => {
									const groupAccounts = groupedAccounts[group.id] || [];
									if (groupAccounts.length === 0) return null;

									return (
										<div key={group.id}>
											<DropdownMenuLabel className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
												<FolderOpen className="h-3 w-3" />
												{group.name}
											</DropdownMenuLabel>
											{groupAccounts.map((account) => (
												<DropdownMenuItem
													className="flex items-center gap-2.5 pl-6 font-mono text-xs"
													key={account.id}
													onClick={() => setSelectedAccountId(account.id)}
												>
													<div
														className={cn(
															"h-2.5 w-2.5 rounded-full",
															ACCOUNT_TYPE_COLORS[account.accountType],
														)}
													/>
													<div className="flex-1 truncate">
														<span>{account.name}</span>
														{account.accountType === "prop_challenge" &&
															account.challengeStatus && (
																<span
																	className={cn(
																		"ml-1.5 text-[10px]",
																		account.challengeStatus === "passed" &&
																			"text-profit",
																		account.challengeStatus === "failed" &&
																			"text-loss",
																		account.challengeStatus === "active" &&
																			"text-amber-500",
																	)}
																>
																	({account.challengeStatus})
																</span>
															)}
													</div>
													{selectedAccount?.id === account.id && (
														<Check className="h-4 w-4 text-primary" />
													)}
												</DropdownMenuItem>
											))}
										</div>
									);
								})}

								{/* Ungrouped accounts */}
								{groupedAccounts.ungrouped &&
									groupedAccounts.ungrouped.length > 0 && (
										<>
											{groups.length > 0 && <DropdownMenuSeparator />}
											{groups.length > 0 && (
												<DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
													Ungrouped
												</DropdownMenuLabel>
											)}
											{groupedAccounts.ungrouped.map((account) => (
												<DropdownMenuItem
													className={cn(
														"flex items-center gap-2.5 font-mono text-xs",
														groups.length > 0 && "pl-6",
													)}
													key={account.id}
													onClick={() => setSelectedAccountId(account.id)}
												>
													<div
														className={cn(
															"h-2.5 w-2.5 rounded-full",
															ACCOUNT_TYPE_COLORS[account.accountType],
														)}
													/>
													<div className="flex-1 truncate">
														<span>{account.name}</span>
														{account.accountType === "prop_challenge" &&
															account.challengeStatus && (
																<span
																	className={cn(
																		"ml-1.5 text-[10px]",
																		account.challengeStatus === "passed" &&
																			"text-profit",
																		account.challengeStatus === "failed" &&
																			"text-loss",
																		account.challengeStatus === "active" &&
																			"text-amber-500",
																	)}
																>
																	({account.challengeStatus})
																</span>
															)}
													</div>
													{selectedAccount?.id === account.id && (
														<Check className="h-4 w-4 text-primary" />
													)}
												</DropdownMenuItem>
											))}
										</>
									)}

								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										className="flex items-center gap-2 font-mono text-xs"
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
						<Button
							className="mt-3 w-full font-mono text-xs uppercase tracking-wider group relative overflow-hidden"
							size="sm"
						>
							<span className="relative z-10 flex items-center">
								<Zap className="mr-2 h-4 w-4" />
								Add Trade
							</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-[200px]">
						<DropdownMenuItem asChild>
							<Link
								className="flex items-center gap-2 font-mono text-xs"
								href="/trade/new"
							>
								<Plus className="h-4 w-4" />
								Log Trade
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link
								className="flex items-center gap-2 font-mono text-xs"
								href="/import"
							>
								<FileSpreadsheet className="h-4 w-4" />
								Import CSV
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarHeader>

			<SidebarContent className="bg-sidebar">
				<SidebarGroup className="py-4">
					<SidebarGroupLabel className="px-3 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-2">
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="gap-1 px-2">
							{mainNavItems.map((item) => {
								const isActive = pathname === item.href;
								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											className={cn(
												"font-mono text-xs uppercase tracking-wider rounded-lg transition-all",
												isActive && "bg-primary/10 text-primary border border-primary/20",
												!isActive && "hover:bg-white/[0.05]",
											)}
											isActive={isActive}
										>
											<Link href={item.href} className="flex items-center gap-3 px-3 py-2">
												<item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t border-white/10 bg-gradient-to-t from-white/[0.02] to-transparent">
				<SidebarMenu className="gap-1 p-2">
					<SidebarMenuItem>
						<ThemeSelector />
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className={cn(
								"font-mono text-xs uppercase tracking-wider rounded-lg",
								pathname === "/settings" && "bg-primary/10 text-primary border border-primary/20",
							)}
							isActive={pathname === "/settings"}
						>
							<Link href="/settings" className="flex items-center gap-3 px-3 py-2">
								<Settings className={cn("h-4 w-4", pathname === "/settings" && "text-primary")} />
								<span>Settings</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
							<UserButton
								afterSignOutUrl="/"
								appearance={{
									elements: {
										avatarBox: "h-8 w-8 ring-2 ring-white/10",
									},
								}}
							/>
							<span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider">
								Account
							</span>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
