"use client";

import { ArrowLeft, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "@/contexts/account-context";
import { FOREX_SYMBOLS, FUTURES_SYMBOLS } from "@/lib/symbols";
import { api } from "@/trpc/react";

const SETUP_TYPES = [
	"Breakout",
	"Reversal",
	"Trend Continuation",
	"Range Trade",
	"News Trade",
	"Scalp",
	"Swing",
	"Gap Fill",
	"Support/Resistance",
	"Moving Average",
	"Other",
];

const EMOTIONAL_STATES = [
	{ value: "confident", label: "Confident" },
	{ value: "fearful", label: "Fearful" },
	{ value: "greedy", label: "Greedy" },
	{ value: "neutral", label: "Neutral" },
	{ value: "frustrated", label: "Frustrated" },
	{ value: "excited", label: "Excited" },
	{ value: "anxious", label: "Anxious" },
];

export default function NewTradePage() {
	const router = useRouter();
	const { selectedAccountId, accounts } = useAccount();

	// Form state
	const [instrumentType, setInstrumentType] = useState<"futures" | "forex">(
		"futures",
	);
	const [symbol, setSymbol] = useState("");
	const [direction, setDirection] = useState<"long" | "short">("long");
	const [entryPrice, setEntryPrice] = useState("");
	const [entryDate, setEntryDate] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [entryTime, setEntryTime] = useState("");
	const [quantity, setQuantity] = useState("");
	const [isStillOpen, setIsStillOpen] = useState(false);
	const [exitPrice, setExitPrice] = useState("");
	const [exitDate, setExitDate] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [exitTime, setExitTime] = useState("");
	const [stopLoss, setStopLoss] = useState("");
	const [takeProfit, setTakeProfit] = useState("");
	const [fees, setFees] = useState("");
	const [setupType, setSetupType] = useState("");
	const [emotionalState, setEmotionalState] = useState<
		| "confident"
		| "fearful"
		| "greedy"
		| "neutral"
		| "frustrated"
		| "excited"
		| "anxious"
	>("neutral");
	const [notes, setNotes] = useState("");
	const [accountId, setAccountId] = useState<number | undefined>(
		selectedAccountId ?? undefined,
	);

	const createTrade = api.trades.create.useMutation({
		onSuccess: (trade) => {
			if (!isStillOpen && exitPrice && trade) {
				closeTrade.mutate({
					id: trade.id,
					exitPrice,
					exitTime: new Date(`${exitDate}T${exitTime}`).toISOString(),
					fees: fees || undefined,
				});
			} else {
				toast.success("Trade logged successfully");
				router.push("/journal");
			}
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create trade");
		},
	});

	const closeTrade = api.trades.close.useMutation({
		onSuccess: () => {
			toast.success("Trade logged successfully");
			router.push("/journal");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to close trade");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!accountId) {
			toast.error("Please select a trading account");
			return;
		}

		if (!symbol || !entryPrice || !entryDate || !entryTime || !quantity) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!isStillOpen && (!exitPrice || !exitDate || !exitTime)) {
			toast.error("Please provide exit details or mark trade as still open");
			return;
		}

		const entryDateTime = new Date(`${entryDate}T${entryTime}`).toISOString();
		const exitDateTime =
			!isStillOpen && exitDate && exitTime
				? new Date(`${exitDate}T${exitTime}`).toISOString()
				: undefined;

		createTrade.mutate({
			symbol,
			instrumentType,
			direction,
			entryPrice,
			entryTime: entryDateTime,
			exitPrice: !isStillOpen ? exitPrice || undefined : undefined,
			exitTime: exitDateTime,
			quantity,
			stopLoss: stopLoss || undefined,
			takeProfit: takeProfit || undefined,
			setupType: setupType || undefined,
			emotionalState,
			notes: notes || undefined,
			accountId,
		});
	};

	const symbols =
		instrumentType === "futures" ? FUTURES_SYMBOLS : FOREX_SYMBOLS;
	const isPending = createTrade.isPending || closeTrade.isPending;

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button asChild size="icon" variant="ghost">
					<Link href="/journal">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/35 px-3 py-1.5 text-sm backdrop-blur">
						<span className="h-1.5 w-1.5 rounded-full bg-primary" />
						<span className="text-muted-foreground">Capture</span>
					</div>
					<h1 className="mt-3 font-semibold text-3xl tracking-tight">
						Log Trade
					</h1>
					<p className="mt-1 text-muted-foreground">Record a completed trade</p>
				</div>
			</div>

			<form className="space-y-6" onSubmit={handleSubmit}>
				{/* Account Selection */}
				{accounts.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Wallet className="h-5 w-5" />
								Trading Account
							</CardTitle>
							<CardDescription>
								Select which account to log this trade to
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Select
								onValueChange={(value) =>
									setAccountId(value ? parseInt(value, 10) : undefined)
								}
								value={accountId?.toString() ?? ""}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select account" />
								</SelectTrigger>
								<SelectContent>
									{accounts.map((acc) => (
										<SelectItem key={acc.id} value={acc.id.toString()}>
											{acc.name} {acc.broker ? `(${acc.broker})` : ""}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</CardContent>
					</Card>
				)}

				{/* Instrument Type */}
				<Card>
					<CardHeader>
						<CardTitle>Instrument</CardTitle>
						<CardDescription>Select the type and symbol</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Type</Label>
							<Tabs
								onValueChange={(v) => {
									setInstrumentType(v as "futures" | "forex");
									setSymbol("");
								}}
								value={instrumentType}
							>
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="futures">Futures</TabsTrigger>
									<TabsTrigger value="forex">Forex</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<div className="space-y-2">
							<Label>Symbol *</Label>
							<Select onValueChange={setSymbol} value={symbol}>
								<SelectTrigger>
									<SelectValue placeholder="Select a symbol" />
								</SelectTrigger>
								<SelectContent>
									{symbols.map((s) => (
										<SelectItem key={s.value} value={s.value}>
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Entry Details */}
				<Card>
					<CardHeader>
						<CardTitle>Entry</CardTitle>
						<CardDescription>When you entered the trade</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Direction</Label>
							<Tabs
								onValueChange={(v) => setDirection(v as "long" | "short")}
								value={direction}
							>
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger
										className="data-[state=active]:bg-profit/20 data-[state=active]:text-profit"
										value="long"
									>
										Long
									</TabsTrigger>
									<TabsTrigger
										className="data-[state=active]:bg-loss/20 data-[state=active]:text-loss"
										value="short"
									>
										Short
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>Entry Price *</Label>
								<Input
									className="font-mono"
									onChange={(e) => setEntryPrice(e.target.value)}
									placeholder="0.00"
									step="any"
									type="number"
									value={entryPrice}
								/>
							</div>

							<div className="space-y-2">
								<Label>
									{instrumentType === "futures" ? "Contracts *" : "Lot Size *"}
								</Label>
								<Input
									className="font-mono"
									onChange={(e) => setQuantity(e.target.value)}
									placeholder={instrumentType === "futures" ? "1" : "0.01"}
									step="any"
									type="number"
									value={quantity}
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>Entry Date *</Label>
								<Input
									onChange={(e) => setEntryDate(e.target.value)}
									type="date"
									value={entryDate}
								/>
							</div>

							<div className="space-y-2">
								<Label>Entry Time *</Label>
								<Input
									onChange={(e) => setEntryTime(e.target.value)}
									type="time"
									value={entryTime}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Exit Details */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Exit</CardTitle>
								<CardDescription>When you exited the trade</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									checked={isStillOpen}
									id="stillOpen"
									onCheckedChange={(checked) =>
										setIsStillOpen(checked === true)
									}
								/>
								<Label
									className="cursor-pointer font-normal text-sm"
									htmlFor="stillOpen"
								>
									Trade still open
								</Label>
							</div>
						</div>
					</CardHeader>
					{!isStillOpen && (
						<CardContent className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label>Exit Price *</Label>
									<Input
										className="font-mono"
										onChange={(e) => setExitPrice(e.target.value)}
										placeholder="0.00"
										step="any"
										type="number"
										value={exitPrice}
									/>
								</div>

								<div className="space-y-2">
									<Label>Fees / Commission</Label>
									<Input
										className="font-mono"
										onChange={(e) => setFees(e.target.value)}
										placeholder="0.00"
										step="any"
										type="number"
										value={fees}
									/>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label>Exit Date *</Label>
									<Input
										onChange={(e) => setExitDate(e.target.value)}
										type="date"
										value={exitDate}
									/>
								</div>

								<div className="space-y-2">
									<Label>Exit Time *</Label>
									<Input
										onChange={(e) => setExitTime(e.target.value)}
										type="time"
										value={exitTime}
									/>
								</div>
							</div>
						</CardContent>
					)}
				</Card>

				{/* Risk Management */}
				<Card>
					<CardHeader>
						<CardTitle>Risk Management</CardTitle>
						<CardDescription>Your planned levels (optional)</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>Stop Loss</Label>
								<Input
									className="font-mono"
									onChange={(e) => setStopLoss(e.target.value)}
									placeholder="Optional"
									step="any"
									type="number"
									value={stopLoss}
								/>
							</div>

							<div className="space-y-2">
								<Label>Take Profit</Label>
								<Input
									className="font-mono"
									onChange={(e) => setTakeProfit(e.target.value)}
									placeholder="Optional"
									step="any"
									type="number"
									value={takeProfit}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Trade Context */}
				<Card>
					<CardHeader>
						<CardTitle>Trade Context</CardTitle>
						<CardDescription>
							Additional information about the trade
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label>Setup Type</Label>
								<Select onValueChange={setSetupType} value={setupType}>
									<SelectTrigger>
										<SelectValue placeholder="Select setup type" />
									</SelectTrigger>
									<SelectContent>
										{SETUP_TYPES.map((setup) => (
											<SelectItem key={setup} value={setup}>
												{setup}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Emotional State</Label>
								<Select
									onValueChange={(v) =>
										setEmotionalState(
											v as
												| "confident"
												| "fearful"
												| "greedy"
												| "neutral"
												| "frustrated"
												| "excited"
												| "anxious",
										)
									}
									value={emotionalState}
								>
									<SelectTrigger>
										<SelectValue placeholder="How were you feeling?" />
									</SelectTrigger>
									<SelectContent>
										{EMOTIONAL_STATES.map((state) => (
											<SelectItem key={state.value} value={state.value}>
												{state.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Notes</Label>
							<Textarea
								onChange={(e) => setNotes(e.target.value)}
								placeholder="What was your reasoning? What did you learn?"
								rows={4}
								value={notes}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Submit */}
				<div className="flex justify-end gap-4">
					<Button asChild type="button" variant="outline">
						<Link href="/journal">Cancel</Link>
					</Button>
					<Button disabled={isPending} type="submit">
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Log Trade
					</Button>
				</div>
			</form>
		</div>
	);
}
