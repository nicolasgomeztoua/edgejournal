import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(
	value: number | string | null | undefined,
	currency = "USD"
): string {
	if (value === null || value === undefined) return "-";
	const num = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(num)) return "-";

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
}

/**
 * Format a number with sign (+ or -)
 */
export function formatPnL(
	value: number | string | null | undefined,
	currency = "USD"
): string {
	if (value === null || value === undefined) return "-";
	const num = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(num)) return "-";

	const formatted = formatCurrency(Math.abs(num), currency);
	if (num > 0) return `+${formatted}`;
	if (num < 0) return `-${formatted.replace("-", "")}`;
	return formatted;
}

/**
 * Format a percentage
 */
export function formatPercent(
	value: number | string | null | undefined,
	decimals = 1
): string {
	if (value === null || value === undefined) return "-";
	const num = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(num)) return "-";

	return `${num >= 0 ? "+" : ""}${num.toFixed(decimals)}%`;
}

/**
 * Format a number with appropriate precision
 */
export function formatNumber(
	value: number | string | null | undefined,
	decimals = 2
): string {
	if (value === null || value === undefined) return "-";
	const num = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(num)) return "-";

	return num.toLocaleString("en-US", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

/**
 * Format a date for display
 */
export function formatDate(
	date: Date | string | null | undefined,
	options: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
		year: "numeric",
	}
): string {
	if (!date) return "-";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", options);
}

/**
 * Format a time for display
 */
export function formatTime(
	date: Date | string | null | undefined,
	options: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
	}
): string {
	if (!date) return "-";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleTimeString("en-US", options);
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string | null | undefined): string {
	if (!date) return "-";
	const d = typeof date === "string" ? new Date(date) : date;
	return `${formatDate(d)} ${formatTime(d)}`;
}

/**
 * Get PnL color class based on value
 */
export function getPnLColorClass(value: number | string | null | undefined): string {
	if (value === null || value === undefined) return "text-muted-foreground";
	const num = typeof value === "string" ? parseFloat(value) : value;
	if (isNaN(num)) return "text-muted-foreground";

	if (num > 0) return "text-profit";
	if (num < 0) return "text-loss";
	return "text-breakeven";
}

/**
 * Calculate win rate from trades
 */
export function calculateWinRate(wins: number, total: number): number {
	if (total === 0) return 0;
	return (wins / total) * 100;
}

/**
 * Calculate profit factor
 */
export function calculateProfitFactor(
	grossProfit: number,
	grossLoss: number
): number {
	if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
	return Math.abs(grossProfit / grossLoss);
}
