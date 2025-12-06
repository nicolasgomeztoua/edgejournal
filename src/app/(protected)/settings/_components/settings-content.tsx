"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Check,
	Edit,
	Eye,
	EyeOff,
	Key,
	Loader2,
	Plus,
	Save,
	Shield,
	Sparkles,
	Star,
	Trash2,
	Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useAccount } from "@/contexts/account-context";
import { cn } from "@/lib/utils";

const AI_PROVIDERS = [
	{
		id: "openai",
		name: "OpenAI",
		description: "GPT-4, GPT-3.5 Turbo",
		placeholder: "sk-...",
	},
	{
		id: "anthropic",
		name: "Anthropic",
		description: "Claude 3, Claude 2",
		placeholder: "sk-ant-...",
	},
	{
		id: "google",
		name: "Google AI",
		description: "Gemini Pro, Gemini Ultra",
		placeholder: "AI...",
	},
];

const ACCOUNT_TYPE_COLORS = {
	live: "bg-green-500",
	demo: "bg-blue-500",
	paper: "bg-amber-500",
};

const ACCOUNT_TYPE_LABELS = {
	live: "Live",
	demo: "Demo",
	paper: "Paper",
};

const PLATFORM_LABELS: Record<string, string> = {
	mt4: "MT4",
	mt5: "MT5",
	projectx: "ProjectX",
	ninjatrader: "NinjaTrader",
	other: "Manual",
};

export function SettingsContent() {
	const { user } = useUser();
	const searchParams = useSearchParams();
	const [saving, setSaving] = useState(false);
	const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
	const [activeTab, setActiveTab] = useState("general");
	
	// Account management state
	const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
	const [editingAccount, setEditingAccount] = useState<number | null>(null);
	const [accountForm, setAccountForm] = useState({
		name: "",
		broker: "",
		platform: "other" as "mt4" | "mt5" | "projectx" | "ninjatrader" | "other",
		accountType: "live" as "live" | "demo" | "paper",
		initialBalance: "",
		currency: "USD",
		accountNumber: "",
		notes: "",
		color: "#6366f1",
	});

	const { refetchAccounts } = useAccount();
	const { data: accounts = [], isLoading: loadingAccounts, refetch: refetchAccountsList } = api.accounts.getAll.useQuery();
	
	const createAccount = api.accounts.create.useMutation({
		onSuccess: () => {
			toast.success("Account created");
			setIsAccountDialogOpen(false);
			resetAccountForm();
			refetchAccountsList();
			refetchAccounts();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create account");
		},
	});

	const updateAccount = api.accounts.update.useMutation({
		onSuccess: () => {
			toast.success("Account updated");
			setIsAccountDialogOpen(false);
			setEditingAccount(null);
			resetAccountForm();
			refetchAccountsList();
			refetchAccounts();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update account");
		},
	});

	const deleteAccount = api.accounts.delete.useMutation({
		onSuccess: () => {
			toast.success("Account deleted");
			refetchAccountsList();
			refetchAccounts();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete account");
		},
	});

	const setDefaultAccount = api.accounts.setDefault.useMutation({
		onSuccess: () => {
			toast.success("Default account updated");
			refetchAccountsList();
			refetchAccounts();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to set default account");
		},
	});

	// Check URL params for tab
	useEffect(() => {
		const tab = searchParams.get("tab");
		if (tab === "accounts") {
			setActiveTab("accounts");
		}
	}, [searchParams]);
	
	const [settings, setSettings] = useState({
		preferredProvider: "openai",
		openaiKey: "",
		anthropicKey: "",
		googleKey: "",
		defaultInstrument: "futures",
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		currency: "USD",
		breakevenThreshold: "3.00",
	});
	
	// Fetch user settings
	const { data: userSettings } = api.settings.get.useQuery();
	const updateSettings = api.settings.update.useMutation({
		onSuccess: () => {
			toast.success("Settings saved");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to save settings");
		},
	});

	// Sync fetched settings to local state
	useEffect(() => {
		if (userSettings) {
			setSettings((prev) => ({
				...prev,
				preferredProvider: userSettings.preferredAiProvider ?? "openai",
				openaiKey: userSettings.openaiApiKey ?? "",
				anthropicKey: userSettings.anthropicApiKey ?? "",
				googleKey: userSettings.googleApiKey ?? "",
				defaultInstrument: userSettings.defaultInstrumentType ?? "futures",
				timezone: userSettings.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
				currency: userSettings.currency ?? "USD",
				breakevenThreshold: userSettings.breakevenThreshold ?? "3.00",
			}));
		}
	}, [userSettings]);

	const resetAccountForm = () => {
		setAccountForm({
			name: "",
			broker: "",
			platform: "other",
			accountType: "live",
			initialBalance: "",
			currency: "USD",
			accountNumber: "",
			notes: "",
			color: "#6366f1",
		});
	};

	const openEditAccount = (account: typeof accounts[0]) => {
		setEditingAccount(account.id);
		setAccountForm({
			name: account.name,
			broker: account.broker ?? "",
			platform: (account.platform as "mt4" | "mt5" | "projectx" | "ninjatrader" | "other") ?? "other",
			accountType: account.accountType,
			initialBalance: account.initialBalance ?? "",
			currency: account.currency ?? "USD",
			accountNumber: account.accountNumber ?? "",
			notes: account.notes ?? "",
			color: account.color ?? "#6366f1",
		});
		setIsAccountDialogOpen(true);
	};

	const handleAccountSubmit = () => {
		if (!accountForm.name.trim()) {
			toast.error("Account name is required");
			return;
		}

		if (editingAccount) {
			updateAccount.mutate({
				id: editingAccount,
				...accountForm,
			});
		} else {
			createAccount.mutate(accountForm);
		}
	};

	const toggleShowKey = (provider: string) => {
		setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
	};

	const handleSave = async () => {
		setSaving(true);
		
		// Simulate save - in production, this would call a tRPC mutation
		await new Promise((resolve) => setTimeout(resolve, 1000));
		
		toast.success("Settings saved successfully");
		setSaving(false);
	};

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Configure your accounts and AI integrations
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>

			<TabsList className="grid w-full grid-cols-3">
				<TabsTrigger value="general">General</TabsTrigger>
				<TabsTrigger value="accounts">Trading Accounts</TabsTrigger>
				<TabsTrigger value="ai">AI Providers</TabsTrigger>
			</TabsList>

			{/* General Tab */}
			<TabsContent value="general" className="space-y-6">
				{/* Account Info */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Profile
						</CardTitle>
						<CardDescription>Your account information</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-4">
							{user?.imageUrl && (
								<img
									src={user.imageUrl}
									alt="Profile"
									className="h-16 w-16 rounded-full"
								/>
							)}
							<div>
								<p className="font-medium">
									{user?.firstName} {user?.lastName}
								</p>
								<p className="text-sm text-muted-foreground">
									{user?.primaryEmailAddress?.emailAddress}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Trading Preferences */}
				<Card>
					<CardHeader>
						<CardTitle>Trading Preferences</CardTitle>
						<CardDescription>
							Default settings for new trades
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>Default Instrument</Label>
								<Select
									value={settings.defaultInstrument}
									onValueChange={(value) =>
										setSettings({ ...settings, defaultInstrument: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="futures">Futures</SelectItem>
										<SelectItem value="forex">Forex</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Currency</Label>
								<Select
									value={settings.currency}
									onValueChange={(value) =>
										setSettings({ ...settings, currency: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="USD">USD ($)</SelectItem>
										<SelectItem value="EUR">EUR (€)</SelectItem>
										<SelectItem value="GBP">GBP (£)</SelectItem>
										<SelectItem value="JPY">JPY (¥)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Timezone</Label>
							<Select
								value={settings.timezone}
								onValueChange={(value) =>
									setSettings({ ...settings, timezone: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="America/New_York">
										Eastern Time (ET)
									</SelectItem>
									<SelectItem value="America/Chicago">
										Central Time (CT)
									</SelectItem>
									<SelectItem value="America/Denver">
										Mountain Time (MT)
									</SelectItem>
									<SelectItem value="America/Los_Angeles">
										Pacific Time (PT)
									</SelectItem>
									<SelectItem value="Europe/London">
										London (GMT/BST)
									</SelectItem>
									<SelectItem value="Europe/Paris">
										Central European (CET)
									</SelectItem>
									<SelectItem value="Asia/Tokyo">
										Tokyo (JST)
									</SelectItem>
									<SelectItem value="Asia/Singapore">
										Singapore (SGT)
									</SelectItem>
								<SelectItem value="UTC">UTC</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="space-y-2">
						<Label>Breakeven Threshold</Label>
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground">$</span>
							<Input
								type="number"
								step="0.01"
								min="0"
								value={settings.breakevenThreshold}
								onChange={(e) =>
									setSettings({ ...settings, breakevenThreshold: e.target.value })
								}
								className="w-32"
								placeholder="3.00"
							/>
						</div>
						<p className="text-sm text-muted-foreground">
							Trades with P&L within ±${settings.breakevenThreshold || "0"} are classified as breakeven
						</p>
					</div>

					<Button
						onClick={() => {
							updateSettings.mutate({
								preferredAiProvider: settings.preferredProvider,
								defaultInstrumentType: settings.defaultInstrument as "futures" | "forex",
								timezone: settings.timezone,
								currency: settings.currency,
								breakevenThreshold: settings.breakevenThreshold,
							});
						}}
						disabled={updateSettings.isPending}
					>
						{updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Preferences
					</Button>
				</CardContent>
			</Card>
		</TabsContent>

		{/* Trading Accounts Tab */}
			<TabsContent value="accounts" className="space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Wallet className="h-5 w-5" />
									Trading Accounts
								</CardTitle>
								<CardDescription>
									Manage your trading accounts to track performance separately
								</CardDescription>
							</div>
							<Dialog open={isAccountDialogOpen} onOpenChange={(open) => {
								setIsAccountDialogOpen(open);
								if (!open) {
									setEditingAccount(null);
									resetAccountForm();
								}
							}}>
								<DialogTrigger asChild>
									<Button>
										<Plus className="mr-2 h-4 w-4" />
										Add Account
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>
											{editingAccount ? "Edit Account" : "Create Account"}
										</DialogTitle>
										<DialogDescription>
											{editingAccount
												? "Update your trading account details"
												: "Add a new trading account to track separately"}
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label>Account Name *</Label>
											<Input
												value={accountForm.name}
												onChange={(e) =>
													setAccountForm({ ...accountForm, name: e.target.value })
												}
												placeholder="e.g., Main Trading Account"
											/>
										</div>
										<div className="grid gap-4 sm:grid-cols-2">
											<div className="space-y-2">
												<Label>Platform *</Label>
												<Select
													value={accountForm.platform}
													onValueChange={(value) =>
														setAccountForm({
															...accountForm,
															platform: value as "mt4" | "mt5" | "projectx" | "ninjatrader" | "other",
														})
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="mt4">MetaTrader 4</SelectItem>
														<SelectItem value="mt5">MetaTrader 5</SelectItem>
														<SelectItem value="projectx">ProjectX</SelectItem>
														<SelectItem value="ninjatrader">NinjaTrader</SelectItem>
														<SelectItem value="other">Other / Manual</SelectItem>
													</SelectContent>
												</Select>
												<p className="text-xs text-muted-foreground">
													Used for CSV import format
												</p>
											</div>
											<div className="space-y-2">
												<Label>Account Type</Label>
												<Select
													value={accountForm.accountType}
													onValueChange={(value) =>
														setAccountForm({
															...accountForm,
															accountType: value as "live" | "demo" | "paper",
														})
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="live">Live</SelectItem>
														<SelectItem value="demo">Demo</SelectItem>
														<SelectItem value="paper">Paper</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="space-y-2">
											<Label>Broker (optional)</Label>
											<Input
												value={accountForm.broker}
												onChange={(e) =>
													setAccountForm({ ...accountForm, broker: e.target.value })
												}
												placeholder="e.g., IC Markets, OANDA"
											/>
										</div>
										<div className="grid gap-4 sm:grid-cols-2">
											<div className="space-y-2">
												<Label>Initial Balance</Label>
												<Input
													type="number"
													value={accountForm.initialBalance}
													onChange={(e) =>
														setAccountForm({ ...accountForm, initialBalance: e.target.value })
													}
													placeholder="0.00"
												/>
											</div>
											<div className="space-y-2">
												<Label>Currency</Label>
												<Select
													value={accountForm.currency}
													onValueChange={(value) =>
														setAccountForm({ ...accountForm, currency: value })
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="USD">USD</SelectItem>
														<SelectItem value="EUR">EUR</SelectItem>
														<SelectItem value="GBP">GBP</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="space-y-2">
											<Label>Account Number (optional)</Label>
											<Input
												value={accountForm.accountNumber}
												onChange={(e) =>
													setAccountForm({ ...accountForm, accountNumber: e.target.value })
												}
												placeholder="For your reference"
											/>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant="outline"
											onClick={() => {
												setIsAccountDialogOpen(false);
												setEditingAccount(null);
												resetAccountForm();
											}}
										>
											Cancel
										</Button>
										<Button
											onClick={handleAccountSubmit}
											disabled={createAccount.isPending || updateAccount.isPending}
										>
											{(createAccount.isPending || updateAccount.isPending) && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{editingAccount ? "Update" : "Create"}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</CardHeader>
					<CardContent>
						{loadingAccounts ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : accounts.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<Wallet className="h-12 w-12 text-muted-foreground/50" />
								<h3 className="mt-4 font-semibold">No accounts yet</h3>
								<p className="text-sm text-muted-foreground">
									Create your first trading account to start tracking
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{accounts.map((account) => (
									<div
										key={account.id}
										className="flex items-center justify-between rounded-lg border p-4"
									>
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"h-3 w-3 rounded-full",
													ACCOUNT_TYPE_COLORS[account.accountType]
												)}
											/>
											<div>
												<div className="flex items-center gap-2">
													<span className="font-medium">{account.name}</span>
													{account.isDefault && (
														<Badge variant="secondary" className="gap-1 text-xs">
															<Star className="h-3 w-3" />
															Default
														</Badge>
													)}
													<Badge variant="outline" className="text-xs">
														{ACCOUNT_TYPE_LABELS[account.accountType]}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{PLATFORM_LABELS[account.platform ?? "other"]}
													{account.broker && ` • ${account.broker}`} •{" "}
													{account.initialBalance
														? `$${parseFloat(account.initialBalance).toLocaleString()}`
														: "$0"}{" "}
													{account.currency}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{!account.isDefault && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setDefaultAccount.mutate({ id: account.id })}
													disabled={setDefaultAccount.isPending}
												>
													<Star className="h-4 w-4" />
												</Button>
											)}
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openEditAccount(account)}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													if (confirm("Are you sure you want to delete this account? Trades will be unassigned.")) {
														deleteAccount.mutate({ id: account.id });
													}
												}}
												disabled={deleteAccount.isPending}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</TabsContent>

			{/* AI Providers Tab */}
			<TabsContent value="ai" className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						AI Provider Keys
					</CardTitle>
					<CardDescription>
						Configure your AI provider API keys for advanced insights
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Security Notice */}
					<div className="flex items-start gap-3 rounded-lg border border-primary/50 bg-primary/5 p-4">
						<Sparkles className="mt-0.5 h-5 w-5 text-primary" />
						<div>
							<p className="font-medium">Bring Your Own Key (BYOK)</p>
							<p className="text-sm text-muted-foreground">
								Your API keys are encrypted and stored securely. We never share
								your keys or use them for any purpose other than generating
								insights for you.
							</p>
						</div>
					</div>

					{/* Preferred Provider */}
					<div className="space-y-2">
						<Label>Preferred AI Provider</Label>
						<Select
							value={settings.preferredProvider}
							onValueChange={(value) =>
								setSettings({ ...settings, preferredProvider: value })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select provider" />
							</SelectTrigger>
							<SelectContent>
								{AI_PROVIDERS.map((provider) => (
									<SelectItem key={provider.id} value={provider.id}>
										{provider.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator />

					{/* API Keys */}
					{AI_PROVIDERS.map((provider) => (
						<div key={provider.id} className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor={provider.id}>
									{provider.name} API Key
									<span className="ml-2 text-xs text-muted-foreground">
										{provider.description}
									</span>
								</Label>
								{settings[`${provider.id}Key` as keyof typeof settings] && (
									<Badge variant="secondary" className="gap-1">
										<Check className="h-3 w-3" />
										Configured
									</Badge>
								)}
							</div>
							<div className="relative">
								<Input
									id={provider.id}
									type={showKeys[provider.id] ? "text" : "password"}
									placeholder={provider.placeholder}
									value={
										settings[
											`${provider.id}Key` as keyof typeof settings
										] as string
									}
									onChange={(e) =>
										setSettings({
											...settings,
											[`${provider.id}Key`]: e.target.value,
										})
									}
									className="pr-10 font-mono"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
									onClick={() => toggleShowKey(provider.id)}
								>
									{showKeys[provider.id] ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
			</TabsContent>
			</Tabs>

			{/* Save Button */}
			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={saving}>
					{saving ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Save className="mr-2 h-4 w-4" />
					)}
					Save Settings
				</Button>
			</div>
		</div>
	);
}

