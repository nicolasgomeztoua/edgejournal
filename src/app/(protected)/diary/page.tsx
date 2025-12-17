"use client";

import {
	BookOpen,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Loader2,
	Save,
	Sparkles,
	Star,
	Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "@/contexts/account-context";
import { cn, formatCurrency, getPnLColorClass } from "@/lib/utils";
import { api } from "@/trpc/react";

const EMOTIONAL_STATES = [
	{ value: "confident", label: "Confident", emoji: "😎" },
	{ value: "neutral", label: "Neutral", emoji: "😐" },
	{ value: "excited", label: "Excited", emoji: "🤩" },
	{ value: "fearful", label: "Fearful", emoji: "😰" },
	{ value: "anxious", label: "Anxious", emoji: "😥" },
	{ value: "frustrated", label: "Frustrated", emoji: "😤" },
	{ value: "greedy", label: "Greedy", emoji: "🤑" },
] as const;

const MARKET_OUTLOOKS = [
	{ value: "bullish", label: "Bullish", color: "text-profit" },
	{ value: "bearish", label: "Bearish", color: "text-loss" },
	{ value: "neutral", label: "Neutral", color: "text-muted-foreground" },
	{ value: "choppy", label: "Choppy", color: "text-yellow-500" },
];

function StarRating({
	value,
	onChange,
}: {
	value: number | null | undefined;
	onChange: (rating: number) => void;
}) {
	const [hovered, setHovered] = useState<number | null>(null);

	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map((star) => {
				const filled = hovered ? star <= hovered : value ? star <= value : false;
				return (
					<button
						className={cn(
							"transition-colors",
							filled ? "text-yellow-400" : "text-muted-foreground/30",
						)}
						key={star}
						onClick={() => onChange(star)}
						onMouseEnter={() => setHovered(star)}
						onMouseLeave={() => setHovered(null)}
						type="button"
					>
						<Star
							className="h-6 w-6"
							fill={filled ? "currentColor" : "none"}
						/>
					</button>
				);
			})}
		</div>
	);
}

function DayStats({
	date,
	accountId,
}: {
	date: string;
	accountId: number | null;
}) {
	// Get trades for this specific day
	const startDate = new Date(date);
	startDate.setHours(0, 0, 0, 0);
	const endDate = new Date(date);
	endDate.setHours(23, 59, 59, 999);

	const { data: stats, isLoading } = api.trades.getStats.useQuery({
		accountId: accountId ?? undefined,
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
	});

	if (isLoading) {
		return (
			<div className="grid grid-cols-4 gap-3">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton className="h-16" key={`skeleton-stat-${i}`} />
				))}
			</div>
		);
	}

	if (!stats || stats.totalTrades === 0) {
		return (
			<div className="flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] py-6 text-muted-foreground">
				No trades on this day
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
				<div className="text-muted-foreground text-xs">Trades</div>
				<div className="font-mono font-semibold text-lg">
					{stats.totalTrades}
				</div>
			</div>
			<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
				<div className="text-muted-foreground text-xs">P&L</div>
				<div
					className={cn(
						"font-mono font-semibold text-lg",
						getPnLColorClass(stats.totalPnl),
					)}
				>
					{stats.totalPnl >= 0 ? "+" : ""}
					{formatCurrency(stats.totalPnl)}
				</div>
			</div>
			<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
				<div className="text-muted-foreground text-xs">Win Rate</div>
				<div
					className={cn(
						"font-mono font-semibold text-lg",
						stats.winRate >= 50 ? "text-profit" : "text-loss",
					)}
				>
					{stats.winRate.toFixed(0)}%
				</div>
			</div>
			<div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
				<div className="text-muted-foreground text-xs">W/L/BE</div>
				<div className="flex gap-1 font-mono text-lg">
					<span className="text-profit">{stats.wins}</span>
					<span className="text-muted-foreground">/</span>
					<span className="text-loss">{stats.losses}</span>
					<span className="text-muted-foreground">/</span>
					<span className="text-yellow-500">{stats.breakevens}</span>
				</div>
			</div>
		</div>
	);
}

export default function DiaryPage() {
	const { selectedAccountId, selectedAccount } = useAccount();

	// Current selected date
	const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

	// Form state
	const [preMarketNotes, setPreMarketNotes] = useState("");
	const [marketOutlook, setMarketOutlook] = useState<string>("");
	const [plannedSetups, setPlannedSetups] = useState("");
	const [postMarketNotes, setPostMarketNotes] = useState("");
	const [lessonsLearned, setLessonsLearned] = useState("");
	const [emotionalState, setEmotionalState] = useState<string>("");
	const [dayRating, setDayRating] = useState<number | null>(null);
	const [dailyGoal, setDailyGoal] = useState("");
	const [goalMet, setGoalMet] = useState<boolean | null>(null);

	const dateKey = selectedDate.toISOString().split("T")[0] ?? "";

	// Fetch existing note for selected date
	const { data: existingNote, isLoading: noteLoading } =
		api.dailyNotes.getByDate.useQuery({
			date: dateKey,
			accountId: selectedAccountId ?? undefined,
		});

	// Upsert mutation
	const upsertMutation = api.dailyNotes.upsert.useMutation({
		onSuccess: () => {
			toast.success("Daily note saved");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to save note");
		},
	});

	// Load existing note into form
	useEffect(() => {
		if (existingNote) {
			setPreMarketNotes(existingNote.preMarketNotes ?? "");
			setMarketOutlook(existingNote.marketOutlook ?? "");
			setPlannedSetups(existingNote.plannedSetups ?? "");
			setPostMarketNotes(existingNote.postMarketNotes ?? "");
			setLessonsLearned(existingNote.lessonsLearned ?? "");
			setEmotionalState(existingNote.emotionalState ?? "");
			setDayRating(existingNote.dayRating);
			setDailyGoal(existingNote.dailyGoal ?? "");
			setGoalMet(existingNote.goalMet);
		} else {
			// Clear form for new date
			setPreMarketNotes("");
			setMarketOutlook("");
			setPlannedSetups("");
			setPostMarketNotes("");
			setLessonsLearned("");
			setEmotionalState("");
			setDayRating(null);
			setDailyGoal("");
			setGoalMet(null);
		}
	}, [existingNote]);

	const handleSave = () => {
		upsertMutation.mutate({
			date: dateKey,
			accountId: selectedAccountId ?? undefined,
			preMarketNotes: preMarketNotes || undefined,
			marketOutlook: marketOutlook || undefined,
			plannedSetups: plannedSetups || undefined,
			postMarketNotes: postMarketNotes || undefined,
			lessonsLearned: lessonsLearned || undefined,
			emotionalState: emotionalState
				? (emotionalState as
						| "confident"
						| "fearful"
						| "greedy"
						| "neutral"
						| "frustrated"
						| "excited"
						| "anxious")
				: undefined,
			dayRating: dayRating ?? undefined,
			dailyGoal: dailyGoal || undefined,
			goalMet: goalMet ?? undefined,
		});
	};

	const navigateDay = (direction: "prev" | "next") => {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
		setSelectedDate(newDate);
	};

	const isToday = useMemo(() => {
		const today = new Date();
		return (
			selectedDate.getDate() === today.getDate() &&
			selectedDate.getMonth() === today.getMonth() &&
			selectedDate.getFullYear() === today.getFullYear()
		);
	}, [selectedDate]);

	const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
	const formattedDate = selectedDate.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="flex items-center gap-2 font-bold text-2xl tracking-tight">
						<BookOpen className="h-6 w-6" />
						Trading Diary
					</h1>
					{selectedAccount && (
						<p className="text-muted-foreground text-sm">
							{selectedAccount.name}
						</p>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={() => navigateDay("prev")}
						size="icon"
						variant="outline"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex min-w-[200px] flex-col items-center">
						<div className="font-semibold">
							{dayName}
							{isToday && (
								<Badge className="ml-2" variant="secondary">
									Today
								</Badge>
							)}
						</div>
						<div className="text-muted-foreground text-sm">{formattedDate}</div>
					</div>
					<Button
						disabled={isToday}
						onClick={() => navigateDay("next")}
						size="icon"
						variant="outline"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Day Stats */}
			<DayStats accountId={selectedAccountId} date={dateKey} />

			{/* Main Content */}
			{noteLoading ? (
				<div className="grid gap-6 lg:grid-cols-2">
					<Skeleton className="h-[400px]" />
					<Skeleton className="h-[400px]" />
				</div>
			) : (
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Pre-Market Planning */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Calendar className="h-4 w-4 text-primary" />
								Pre-Market Planning
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Market Outlook */}
							<div className="space-y-2">
								<Label>Market Outlook</Label>
								<div className="flex flex-wrap gap-2">
									{MARKET_OUTLOOKS.map((outlook) => (
										<button
											className={cn(
												"rounded-lg border border-white/10 px-4 py-2 text-sm transition-colors",
												marketOutlook === outlook.value
													? "border-primary bg-primary/10"
													: "hover:bg-white/5",
											)}
											key={outlook.value}
											onClick={() => setMarketOutlook(outlook.value)}
											type="button"
										>
											<span className={outlook.color}>{outlook.label}</span>
										</button>
									))}
								</div>
							</div>

							{/* Daily Goal */}
							<div className="space-y-2">
								<Label className="flex items-center gap-2">
									<Target className="h-3.5 w-3.5" />
									Daily Goal
								</Label>
								<Textarea
									className="min-h-[60px] resize-none"
									onChange={(e) => setDailyGoal(e.target.value)}
									placeholder="What's your focus for today?"
									value={dailyGoal}
								/>
							</div>

							{/* Planned Setups */}
							<div className="space-y-2">
								<Label>Planned Setups</Label>
								<Textarea
									className="min-h-[80px] resize-none"
									onChange={(e) => setPlannedSetups(e.target.value)}
									placeholder="What setups are you looking for today?"
									value={plannedSetups}
								/>
							</div>

							{/* Pre-Market Notes */}
							<div className="space-y-2">
								<Label>Pre-Market Notes</Label>
								<Textarea
									className="min-h-[100px] resize-none"
									onChange={(e) => setPreMarketNotes(e.target.value)}
									placeholder="Market analysis, news, key levels..."
									value={preMarketNotes}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Post-Market Review */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Sparkles className="h-4 w-4 text-primary" />
								Post-Market Review
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Day Rating */}
							<div className="space-y-2">
								<Label>Rate Your Day</Label>
								<StarRating
									onChange={setDayRating}
									value={dayRating}
								/>
							</div>

							{/* Emotional State */}
							<div className="space-y-2">
								<Label>Emotional State</Label>
								<Select
									onValueChange={setEmotionalState}
									value={emotionalState}
								>
									<SelectTrigger>
										<SelectValue placeholder="How did you feel today?" />
									</SelectTrigger>
									<SelectContent>
										{EMOTIONAL_STATES.map((state) => (
											<SelectItem key={state.value} value={state.value}>
												<span className="flex items-center gap-2">
													<span>{state.emoji}</span>
													<span>{state.label}</span>
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Goal Met */}
							<div className="space-y-2">
								<Label>Did you meet your goal?</Label>
								<div className="flex gap-2">
									<button
										className={cn(
											"flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm transition-colors",
											goalMet === true
												? "border-profit bg-profit/10 text-profit"
												: "hover:bg-white/5",
										)}
										onClick={() => setGoalMet(true)}
										type="button"
									>
										Yes ✓
									</button>
									<button
										className={cn(
											"flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm transition-colors",
											goalMet === false
												? "border-loss bg-loss/10 text-loss"
												: "hover:bg-white/5",
										)}
										onClick={() => setGoalMet(false)}
										type="button"
									>
										No ✗
									</button>
								</div>
							</div>

							{/* Post-Market Notes */}
							<div className="space-y-2">
								<Label>Post-Market Notes</Label>
								<Textarea
									className="min-h-[100px] resize-none"
									onChange={(e) => setPostMarketNotes(e.target.value)}
									placeholder="How did the day go? What worked?"
									value={postMarketNotes}
								/>
							</div>

							{/* Lessons Learned */}
							<div className="space-y-2">
								<Label>Lessons Learned</Label>
								<Textarea
									className="min-h-[80px] resize-none"
									onChange={(e) => setLessonsLearned(e.target.value)}
									placeholder="What did you learn today?"
									value={lessonsLearned}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Save Button */}
			<div className="flex justify-end">
				<Button
					className="min-w-[120px]"
					disabled={upsertMutation.isPending}
					onClick={handleSave}
				>
					{upsertMutation.isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						<>
							<Save className="mr-2 h-4 w-4" />
							Save Entry
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
