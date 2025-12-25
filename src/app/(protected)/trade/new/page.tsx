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
					<span className="mb-1 block font-mono text-xs uppercase tracking-wider text-primary">
						New Entry
					</span>
					<h1 className="font-bold text-2xl tracking-tight">Log Trade</h1>
					<p className="font-mono text-muted-foreground text-xs">
						Record a completed trade
					</p>
				</div>
			</div>

			<form className="space-y-6" onSubmit={handleSubmit}>
				{/* Account Selection */}
				{accounts.length > 0 && (
					<div className="rounded border border-white/10 bg-white/[0.02] p-4">
						<div className="mb-3 flex items-center gap-2">
							<Wallet className="h-4 w-4 text-muted-foreground" />
							<span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Trading Account
							</span>
						</div>
						<Select
							onValueChange={(value) =>
								setAccountId(value ? parseInt(value, 10) : undefined)
							}
							value={accountId?.toString() ?? ""}
						>
							<SelectTrigger className="font-mono text-xs">
								<SelectValue placeholder="Select account" />
							</SelectTrigger>
							<SelectContent>
								{accounts.map((acc) => (
									<SelectItem key={acc.id} value={acc.id.toString()} className="font-mono text-xs">
										{acc.name} {acc.broker ? `(${acc.broker})` : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Instrument Type */}
				<div className="space-y-4 rounded border border-white/10 bg-white/[0.02] p-4">
					<div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
						Instrument
					</div>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Type
							</Label>
							<Tabs
								onValueChange={(v) => {
									setInstrumentType(v as "futures" | "forex");
									setSymbol("");
								}}
								value={instrumentType}
							>
								<TabsList className="grid w-full grid-cols-2 bg-white/[0.02] border border-white/5">
									<TabsTrigger
										value="futures"
										className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-white/10"
									>
										Futures
									</TabsTrigger>
									<TabsTrigger
										value="forex"
										className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-white/10"
									>
										Forex
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<div className="space-y-2">
							<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Symbol <span className="text-loss">*</span>
							</Label>
							<Select onValueChange={setSymbol} value={symbol}>
								<SelectTrigger className="font-mono text-xs">
									<SelectValue placeholder="Select a symbol" />
								</SelectTrigger>
								<SelectContent>
									{symbols.map((s) => (
										<SelectItem key={s.value} value={s.value} className="font-mono text-xs">
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Entry Details */}
				<div className="space-y-4 rounded border border-white/10 bg-white/[0.02] p-4">
					<div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
						Entry
					</div>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Direction
							</Label>
							<Tabs
								onValueChange={(v) => setDirection(v as "long" | "short")}
								value={direction}
							>
								<TabsList className="grid w-full grid-cols-2 bg-white/[0.02] border border-white/5">
									<TabsTrigger
										className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-profit/20 data-[state=active]:text-profit"
										value="long"
									>
										Long
									</TabsTrigger>
									<TabsTrigger
										className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-loss/20 data-[state=active]:text-loss"
										value="short"
									>
										Short
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									Entry Price <span className="text-loss">*</span>
								</Label>
								<Input
									className="font-mono text-sm"
									onChange={(e) => setEntryPrice(e.target.value)}
									placeholder="0.00"
									step="any"
									type="number"
									value={entryPrice}
								/>
							</div>

							<div className="space-y-2">
								<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									{instrumentType === "futures" ? "Contracts" : "Lot Size"} <span className="text-loss">*</span>
								</Label>
								<Input
									className="font-mono text-sm"
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
								<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									Entry Date <span className="text-loss">*</span>
								</Label>
								<Input
									onChange={(e) => setEntryDate(e.target.value)}
									type="date"
									value={entryDate}
									className="font-mono text-sm"
								/>
							</div>

							<div className="space-y-2">
								<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									Entry Time <span className="text-loss">*</span>
								</Label>
								<Input
									onChange={(e) => setEntryTime(e.target.value)}
									type="time"
									value={entryTime}
									className="font-mono text-sm"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Exit Details */}
				<div className="rounded border border-white/10 bg-white/[0.02] p-4">
					<div className="flex items-center justify-between pb-4">
						<div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
							Exit
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
								className="cursor-pointer font-mono text-[10px] uppercase tracking-wider"
								htmlFor="stillOpen"
							>
								Trade still open
							</Label>
						</div>
					</div>
					{!isStillOpen && (
						<div className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										Exit Price <span className="text-loss">*</span>
									</Label>
									<Input
										className="font-mono text-sm"
										onChange={(e) => setExitPrice(e.target.value)}
										placeholder="0.00"
										step="any"
										type="number"
										value={exitPrice}
									/>
								</div>

								<div className="space-y-2">
									<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										Fees / Commission
									</Label>
									<Input
										className="font-mono text-sm"
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
									<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										Exit Date <span className="text-loss">*</span>
									</Label>
									<Input
										onChange={(e) => setExitDate(e.target.value)}
										type="date"
										value={exitDate}
										className="font-mono text-sm"
									/>
								</div>

								<div className="space-y-2">
									<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
										Exit Time <span className="text-loss">*</span>
									</Label>
									<Input
										onChange={(e) => setExitTime(e.target.value)}
										type="time"
										value={exitTime}
										className="font-mono text-sm"
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Risk Management */}
				<div className="space-y-4 rounded border border-white/10 bg-white/[0.02] p-4">
					<div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
						Risk Management
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Stop Loss
							</Label>
							<Input
								className="font-mono text-sm"
								onChange={(e) => setStopLoss(e.target.value)}
								placeholder="Optional"
								step="any"
								type="number"
								value={stopLoss}
							/>
						</div>

						<div className="space-y-2">
							<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Take Profit
							</Label>
							<Input
								className="font-mono text-sm"
								onChange={(e) => setTakeProfit(e.target.value)}
								placeholder="Optional"
								step="any"
								type="number"
								value={takeProfit}
							/>
						</div>
					</div>
				</div>

				{/* Trade Context */}
				<div className="space-y-4 rounded border border-white/10 bg-white/[0.02] p-4">
					<div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
						Trade Context
					</div>
					<div className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									Setup Type
								</Label>
								<Select onValueChange={setSetupType} value={setupType}>
									<SelectTrigger className="font-mono text-xs">
										<SelectValue placeholder="Select setup type" />
									</SelectTrigger>
									<SelectContent>
										{SETUP_TYPES.map((setup) => (
											<SelectItem key={setup} value={setup} className="font-mono text-xs">
												{setup}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
									Emotional State
								</Label>
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
									<SelectTrigger className="font-mono text-xs">
										<SelectValue placeholder="How were you feeling?" />
									</SelectTrigger>
									<SelectContent>
										{EMOTIONAL_STATES.map((state) => (
											<SelectItem key={state.value} value={state.value} className="font-mono text-xs">
												{state.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								Notes
							</Label>
							<Textarea
								onChange={(e) => setNotes(e.target.value)}
								placeholder="What was your reasoning? What did you learn?"
								rows={4}
								value={notes}
								className="font-mono text-sm"
							/>
						</div>
					</div>
				</div>

				{/* Submit */}
				<div className="flex justify-end gap-4">
					<Button asChild type="button" variant="outline" className="font-mono text-xs uppercase tracking-wider">
						<Link href="/journal">Cancel</Link>
					</Button>
					<Button disabled={isPending} type="submit" className="font-mono text-xs uppercase tracking-wider">
						{isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
						Log Trade
					</Button>
				</div>
			</form>
		</div>
	);
}
