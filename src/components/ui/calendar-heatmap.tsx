"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

interface DayData {
	date: Date;
	pnl: number;
	trades: number;
}

interface CalendarHeatmapProps {
	data: DayData[];
	onDayClick?: (day: DayData) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function getDaysInMonth(year: number, month: number): Date[] {
	const days: Date[] = [];
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	// Add padding days from previous month
	for (let i = 0; i < firstDay.getDay(); i++) {
		const d = new Date(year, month, -i);
		days.unshift(d);
	}

	// Add days of current month
	for (let d = 1; d <= lastDay.getDate(); d++) {
		days.push(new Date(year, month, d));
	}

	// Add padding days from next month
	const remaining = 42 - days.length; // 6 rows x 7 days
	for (let i = 1; i <= remaining; i++) {
		days.push(new Date(year, month + 1, i));
	}

	return days;
}

function getIntensity(pnl: number, maxAbsPnl: number): number {
	if (maxAbsPnl === 0) return 0;
	return Math.min(Math.abs(pnl) / maxAbsPnl, 1);
}

export function CalendarHeatmap({ data, onDayClick }: CalendarHeatmapProps) {
	const [currentMonth, setCurrentMonth] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});

	const days = useMemo(
		() => getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()),
		[currentMonth],
	);

	const dayDataMap = useMemo(() => {
		const map = new Map<string, DayData>();
		for (const d of data) {
			const key = d.date.toISOString().split("T")[0];
			if (key) {
				map.set(key, d);
			}
		}
		return map;
	}, [data]);

	const maxAbsPnl = useMemo(() => {
		return data.reduce((max, d) => Math.max(max, Math.abs(d.pnl)), 0);
	}, [data]);

	// Monthly summary
	const monthlyStats = useMemo(() => {
		let totalPnl = 0;
		let winningDays = 0;
		let losingDays = 0;
		let totalTrades = 0;

		for (const [key, dayData] of dayDataMap) {
			const keyDate = new Date(key);
			if (
				keyDate.getMonth() === currentMonth.getMonth() &&
				keyDate.getFullYear() === currentMonth.getFullYear()
			) {
				totalPnl += dayData.pnl;
				totalTrades += dayData.trades;
				if (dayData.pnl > 0) winningDays++;
				if (dayData.pnl < 0) losingDays++;
			}
		}

		return { totalPnl, winningDays, losingDays, totalTrades };
	}, [dayDataMap, currentMonth]);

	const goToPreviousMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
		);
	};

	const goToNextMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
		);
	};

	const goToToday = () => {
		const now = new Date();
		setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button onClick={goToPreviousMonth} size="icon" variant="ghost">
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<h3 className="min-w-[140px] text-center font-semibold">
						{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
					</h3>
					<Button onClick={goToNextMonth} size="icon" variant="ghost">
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						className="ml-2"
						onClick={goToToday}
						size="sm"
						variant="outline"
					>
						Today
					</Button>
				</div>
				{/* Monthly Summary */}
				<div className="flex items-center gap-6 text-sm">
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">Monthly P&L:</span>
						<span
							className={cn(
								"font-mono font-semibold",
								monthlyStats.totalPnl >= 0 ? "text-profit" : "text-loss",
							)}
						>
							{monthlyStats.totalPnl >= 0 ? "+" : ""}
							{formatCurrency(monthlyStats.totalPnl)}
						</span>
					</div>
					<div className="flex items-center gap-3 text-xs">
						<span className="text-profit">{monthlyStats.winningDays}W</span>
						<span className="text-loss">{monthlyStats.losingDays}L</span>
						<span className="text-muted-foreground">
							{monthlyStats.totalTrades} trades
						</span>
					</div>
				</div>
			</div>

			{/* Weekday headers */}
			<div className="grid grid-cols-7 gap-1">
				{WEEKDAYS.map((day) => (
					<div
						className="py-2 text-center font-mono text-muted-foreground text-xs"
						key={day}
					>
						{day}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div className="grid grid-cols-7 gap-1">
				{days.map((day, index) => {
					const key = day.toISOString().split("T")[0];
					const dayData = key ? dayDataMap.get(key) : undefined;
					const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
					const isToday =
						day.toDateString() === new Date().toDateString();

					const intensity = dayData
						? getIntensity(dayData.pnl, maxAbsPnl)
						: 0;
					const isPositive = dayData ? dayData.pnl >= 0 : false;

					return (
						<button
							className={cn(
								"group relative aspect-square cursor-pointer rounded transition-all",
								"hover:ring-2 hover:ring-white/20",
								!isCurrentMonth && "opacity-30",
								isToday && "ring-1 ring-primary/50",
							)}
							key={`${key ?? "invalid"}-${index}`}
							onClick={() => dayData && onDayClick?.(dayData)}
							style={{
								backgroundColor: dayData
									? isPositive
										? `rgba(0, 255, 136, ${0.1 + intensity * 0.5})`
										: `rgba(255, 59, 59, ${0.1 + intensity * 0.5})`
									: "rgba(255, 255, 255, 0.02)",
							}}
							type="button"
						>
							<span
								className={cn(
									"absolute top-1 left-2 font-mono text-xs",
									isToday ? "font-bold text-primary" : "text-muted-foreground",
								)}
							>
								{day.getDate()}
							</span>

							{dayData && (
								<>
									<span
										className={cn(
											"absolute right-1 bottom-1 font-medium font-mono text-[10px]",
											isPositive ? "text-profit" : "text-loss",
										)}
									>
										{isPositive ? "+" : ""}
										{dayData.pnl.toFixed(0)}
									</span>

									{/* Tooltip on hover */}
									<div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 scale-0 rounded border border-white/10 bg-card px-3 py-2 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
										<div className="whitespace-nowrap text-sm">
											<div className="mb-1 font-mono text-muted-foreground text-xs">
												{day.toLocaleDateString("en-US", {
													weekday: "short",
													month: "short",
													day: "numeric",
												})}
											</div>
											<div
												className={cn(
													"font-mono font-semibold",
													isPositive ? "text-profit" : "text-loss",
												)}
											>
												{isPositive ? "+" : ""}
												{formatCurrency(dayData.pnl)}
											</div>
											<div className="font-mono text-muted-foreground text-xs">
												{dayData.trades} trade{dayData.trades !== 1 ? "s" : ""}
											</div>
										</div>
									</div>
								</>
							)}
						</button>
					);
				})}
			</div>

			{/* Legend */}
			<div className="flex items-center justify-center gap-4 pt-2">
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<div className="h-3 w-3 rounded bg-loss/20" />
						<div className="h-3 w-3 rounded bg-loss/40" />
						<div className="h-3 w-3 rounded bg-loss/60" />
					</div>
					<span className="font-mono text-muted-foreground text-xs">Loss</span>
				</div>
				<div className="h-4 w-px bg-white/10" />
				<div className="flex items-center gap-2">
					<span className="font-mono text-muted-foreground text-xs">
						Profit
					</span>
					<div className="flex items-center gap-1">
						<div className="h-3 w-3 rounded bg-profit/20" />
						<div className="h-3 w-3 rounded bg-profit/40" />
						<div className="h-3 w-3 rounded bg-profit/60" />
					</div>
				</div>
			</div>
		</div>
	);
}
