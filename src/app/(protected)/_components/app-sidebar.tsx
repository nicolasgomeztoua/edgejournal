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

const ACCOUNT_TYPE_COLORS = {
	live: "bg-profit",
	demo: "bg-accent",
	paper: "bg-breakeven",
};

export function AppSidebar() {
	const pathname = usePathname();
	const { accounts, selectedAccount, setSelectedAccountId, isLoading } =
		useAccount();

	return (
		<Sidebar className="border-r border-white/5">
			<SidebarHeader className="border-b border-white/5 bg-black/20">
				{/* Logo */}
				<Link className="flex items-center gap-3 px-2 py-3" href="/dashboard">
					<svg
						aria-labelledby="sidebar-logo-title"
						className="h-8 w-8"
						fill="none"
						role="img"
						viewBox="0 0 32 32"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title id="sidebar-logo-title">EdgeJournal Logo</title>
						<rect className="fill-primary" height="32" rx="2" width="32" />
						<path
							className="fill-primary-foreground"
							d="M8 8h16v3H11v5h11v3H11v5h13v3H8V8z"
						/>
					</svg>
					<span className="font-medium font-mono text-sm uppercase tracking-tight">
						Edge<span className="text-primary">Journal</span>
					</span>
				</Link>

				{/* Account Selector */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className="flex w-full items-center gap-2 rounded border border-white/10 bg-white/[0.02] px-3 py-2 text-left font-mono text-xs transition-colors hover:border-white/20 hover:bg-white/[0.04]"
							type="button"
						>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/50" />
									<span className="text-muted-foreground uppercase tracking-wider">
										Loading...
									</span>
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
										<span className="font-medium uppercase tracking-wider">
											{selectedAccount.name}
										</span>
										{selectedAccount.broker && (
											<span className="ml-1 text-muted-foreground">
												({selectedAccount.broker})
											</span>
										)}
									</div>
									<ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
								</>
							) : (
								<>
									<Wallet className="h-3 w-3 text-muted-foreground" />
									<span className="text-muted-foreground uppercase tracking-wider">
										No account
									</span>
									<ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
								</>
							)}
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-[220px]">
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
								{accounts.map((account) => (
									<DropdownMenuItem
										className="flex items-center gap-2 font-mono text-xs"
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
												<span className="ml-1 text-muted-foreground">
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
						<Button className="mt-3 w-full font-mono text-xs uppercase tracking-wider" size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Trade
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-[200px]">
						<DropdownMenuItem asChild>
							<Link className="flex items-center gap-2 font-mono text-xs" href="/trade/new">
								<Plus className="h-4 w-4" />
								Log Trade
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link className="flex items-center gap-2 font-mono text-xs" href="/import">
								<FileSpreadsheet className="h-4 w-4" />
								Import CSV
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarHeader>

			<SidebarContent className="bg-black/10">
				<SidebarGroup>
					<SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.href}
										className="font-mono text-xs uppercase tracking-wider"
									>
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

			<SidebarFooter className="border-t border-white/5 bg-black/20">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							isActive={pathname === "/settings"}
							className="font-mono text-xs uppercase tracking-wider"
						>
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
							<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Account
							</span>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
