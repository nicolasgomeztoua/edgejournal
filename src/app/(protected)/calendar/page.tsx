"use client";

import {
	ChevronLeft,
	ChevronRight,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/contexts/account-context";
import { cn, formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

interface DayData {
	pnl: number;
	trades: number;
	wins: number;
	losses: number;
}

function getDaysInMonth(year: number, month: number) {
	return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
	return new Date(year, month, 1).getDay();
}

function getPnLColor(pnl: number): string {
	if (pnl === 0) return "bg-white/[0.03] border-white/5";
	if (pnl > 0) {
		if (pnl > 500) return "bg-profit/40 border-profit/50";
		if (pnl > 200) return "bg-profit/25 border-profit/30";
		return "bg-profit/15 border-profit/20";
	}
	if (pnl < -500) return "bg-loss/40 border-loss/50";
	if (pnl < -200) return "bg-loss/25 border-loss/30";
	return "bg-loss/15 border-loss/20";
}

function CalendarDay({
	day,
	data,
	isToday,
	isCurrentMonth,
	dateString,
}: {
	day: number;
	data: DayData | null;
	isToday: boolean;
	isCurrentMonth: boolean;
	dateString: string;
}) {
	const hasTrades = data && data.trades > 0;

	return (
		<Link
			className={cn(
				"group relative flex min-h-[80px] flex-col rounded border p-2 transition-all hover:border-white/20",
				!isCurrentMonth && "opacity-30",
				isToday && "ring-2 ring-primary/50",
				hasTrades ? getPnLColor(data.pnl) : "border-white/5 bg-white/[0.01]",
			)}
			href={`/journal?date=${dateString}`}
		>
			<span
				className={cn(
					"font-mono text-xs",
					isToday ? "font-bold text-primary" : "text-muted-foreground",
				)}
			>
				{day}
			</span>

			{hasTrades && (
				<div className="mt-auto">
					<div
						className={cn(
							"font-bold font-mono text-sm",
							data.pnl >= 0 ? "text-profit" : "text-loss",
						)}
					>
						{data.pnl >= 0 ? "+" : ""}
						{formatCurrency(data.pnl)}
					</div>
					<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
						<span>
							{data.trades} trade{data.trades > 1 ? "s" : ""}
						</span>
						<span className="text-profit">{data.wins}W</span>
						<span className="text-loss">{data.losses}L</span>
					</div>
				</div>
			)}
		</Link>
	);
}

function MonthStats({ dailyData }: { dailyData: Record<string, DayData> }) {
	const stats = Object.values(dailyData).reduce(
		(acc, day) => {
			acc.totalPnl += day.pnl;
			acc.totalTrades += day.trades;
			acc.wins += day.wins;
			acc.losses += day.losses;
			if (day.pnl > 0) acc.greenDays++;
			else if (day.pnl < 0) acc.redDays++;
			if (day.pnl > acc.bestDay) acc.bestDay = day.pnl;
			if (day.pnl < acc.worstDay) acc.worstDay = day.pnl;
			return acc;
		},
		{
			totalPnl: 0,
			totalTrades: 0,
			wins: 0,
			losses: 0,
			greenDays: 0,
			redDays: 0,
			bestDay: 0,
			worstDay: 0,
		},
	);

	const tradingDays = stats.greenDays + stats.redDays;
	const winRate =
		stats.wins + stats.losses > 0
			? (stats.wins / (stats.wins + stats.losses)) * 100
			: 0;

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardContent className="pt-4">
					<div className="flex items-center justify-between">
						<span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
							Month P&L
						</span>
						{stats.totalPnl >= 0 ? (
							<TrendingUp className="h-4 w-4 text-profit" />
						) : (
							<TrendingDown className="h-4 w-4 text-loss" />
						)}
					</div>
					<div
						className={cn(
							"mt-1 font-bold font-mono text-2xl",
							stats.totalPnl >= 0 ? "text-profit" : "text-loss",
						)}
					>
						{stats.totalPnl >= 0 ? "+" : ""}
						{formatCurrency(stats.totalPnl)}
					</div>
					<div className="text-muted-foreground text-xs">
						{stats.totalTrades} trades over {tradingDays} days
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-4">
					<div className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
						Win Rate
					</div>
					<div
						className={cn(
							"mt-1 font-bold font-mono text-2xl",
							winRate >= 50 ? "text-profit" : "text-loss",
						)}
					>
						{winRate.toFixed(1)}%
					</div>
					<div className="text-muted-foreground text-xs">
						{stats.wins}W / {stats.losses}L
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-4">
					<div className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
						Best Day
					</div>
					<div className="mt-1 font-bold font-mono text-2xl text-profit">
						+{formatCurrency(stats.bestDay)}
					</div>
					<div className="text-muted-foreground text-xs">
						{stats.greenDays} green days
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-4">
					<div className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
						Worst Day
					</div>
					<div className="mt-1 font-bold font-mono text-2xl text-loss">
						{formatCurrency(stats.worstDay)}
					</div>
					<div className="text-muted-foreground text-xs">
						{stats.redDays} red days
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function CalendarPage() {
	const { selectedAccountId } = useAccount();
	const today = new Date();
	const [currentYear, setCurrentYear] = useState(today.getFullYear());
	const [currentMonth, setCurrentMonth] = useState(today.getMonth());

	const { data, isLoading } = api.trades.getDailyPnL.useQuery({
		year: currentYear,
		month: currentMonth + 1, // API uses 1-indexed months
		accountId: selectedAccountId ?? undefined,
	});

	const goToPreviousMonth = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear(currentYear - 1);
		} else {
			setCurrentMonth(currentMonth - 1);
		}
	};

	const goToNextMonth = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear(currentYear + 1);
		} else {
			setCurrentMonth(currentMonth + 1);
		}
	};

	const goToToday = () => {
		setCurrentYear(today.getFullYear());
		setCurrentMonth(today.getMonth());
	};

	const daysInMonth = getDaysInMonth(currentYear, currentMonth);
	const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
	const daysInPreviousMonth = getDaysInMonth(currentYear, currentMonth - 1);

	// Build calendar grid
	const calendarDays: Array<{
		day: number;
		isCurrentMonth: boolean;
		dateString: string;
	}> = [];

	// Previous month days
	for (let i = firstDayOfMonth - 1; i >= 0; i--) {
		const day = daysInPreviousMonth - i;
		const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
		const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
		calendarDays.push({
			day,
			isCurrentMonth: false,
			dateString: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
		});
	}

	// Current month days
	for (let day = 1; day <= daysInMonth; day++) {
		calendarDays.push({
			day,
			isCurrentMonth: true,
			dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
		});
	}

	// Next month days (fill remaining cells)
	const remainingCells = 42 - calendarDays.length; // 6 rows * 7 days
	for (let day = 1; day <= remainingCells; day++) {
		const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
		const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
		calendarDays.push({
			day,
			isCurrentMonth: false,
			dateString: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
		});
	}

	const isCurrentMonthToday =
		currentMonth === today.getMonth() && currentYear === today.getFullYear();

	const dailyData = data?.days ?? {};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Calendar</h1>
					<p className="text-muted-foreground">
						Visual overview of your daily trading performance
					</p>
				</div>
			</div>

			{/* Month Stats */}
			{!isLoading && <MonthStats dailyData={dailyData} />}

			{/* Calendar Navigation */}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button onClick={goToPreviousMonth} size="icon" variant="outline">
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<CardTitle className="font-mono text-xl">
								{MONTHS[currentMonth]} {currentYear}
							</CardTitle>
							<Button onClick={goToNextMonth} size="icon" variant="outline">
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
						{!isCurrentMonthToday && (
							<Button onClick={goToToday} size="sm" variant="outline">
								Today
							</Button>
						)}
					</div>
					<CardDescription>
						Click on a day to view trades from that date
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-4">
							<div className="grid grid-cols-7 gap-2">
								{DAYS_OF_WEEK.map((day) => (
									<div className="p-2 text-center" key={day}>
										<Skeleton className="mx-auto h-4 w-8" />
									</div>
								))}
							</div>
							<div className="grid grid-cols-7 gap-2">
								{[...Array(35)].map((_, i) => (
									<Skeleton className="h-20" key={`skeleton-${i.toString()}`} />
								))}
							</div>
						</div>
					) : (
						<>
							{/* Day headers */}
							<div className="mb-2 grid grid-cols-7 gap-2">
								{DAYS_OF_WEEK.map((day) => (
									<div
										className="p-2 text-center font-mono text-muted-foreground text-xs uppercase tracking-wider"
										key={day}
									>
										{day}
									</div>
								))}
							</div>

							{/* Calendar grid */}
							<div className="grid grid-cols-7 gap-2">
								{calendarDays.map((calDay) => (
									<CalendarDay
										data={dailyData[calDay.dateString] ?? null}
										dateString={calDay.dateString}
										day={calDay.day}
										isCurrentMonth={calDay.isCurrentMonth}
										isToday={
											isCurrentMonthToday &&
											calDay.isCurrentMonth &&
											calDay.day === today.getDate()
										}
										key={calDay.dateString}
									/>
								))}
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Legend */}
			<div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground text-xs">
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 rounded border border-loss/50 bg-loss/40" />
					<span>Large Loss (&lt; -$500)</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 rounded border border-loss/20 bg-loss/15" />
					<span>Small Loss</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 rounded border border-white/5 bg-white/[0.03]" />
					<span>No trades</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 rounded border border-profit/20 bg-profit/15" />
					<span>Small Win</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 rounded border border-profit/50 bg-profit/40" />
					<span>Large Win (&gt; $500)</span>
				</div>
			</div>
		</div>
	);
}
