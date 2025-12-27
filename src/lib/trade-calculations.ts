import { getForexPipSize, getFuturesSpec } from "./symbols";

// =============================================================================
// TRADE CALCULATIONS
// Display metrics for trade detail page
// =============================================================================

/**
 * Calculate points (price movement)
 * LONG: exit - entry (positive = profit)
 * SHORT: entry - exit (positive = profit)
 */
export function calculatePoints(
	entryPrice: number,
	exitPrice: number | null,
	direction: "long" | "short",
): number | null {
	if (exitPrice === null) return null;
	return direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
}

/**
 * Calculate ticks from points for futures
 */
export function calculateTicks(
	points: number | null,
	symbol: string,
): number | null {
	if (points === null) return null;
	const spec = getFuturesSpec(symbol);
	if (!spec) return null;
	return points / spec.tickSize;
}

/**
 * Calculate pips from points for forex
 */
export function calculatePips(
	points: number | null,
	symbol: string,
): number | null {
	if (points === null) return null;
	const pipSize = getForexPipSize(symbol);
	return points / pipSize;
}

/**
 * Calculate ticks/pips per contract
 */
export function calculateTicksPerContract(
	ticks: number | null,
	quantity: number,
): number | null {
	if (ticks === null || quantity === 0) return null;
	return ticks / quantity;
}

/**
 * Calculate R-Multiple: P&L relative to risk
 */
export function calculateRMultiple(
	entryPrice: number,
	exitPrice: number | null,
	stopLoss: number | null,
	direction: "long" | "short",
): number | null {
	if (exitPrice === null || stopLoss === null) return null;

	const risk = Math.abs(entryPrice - stopLoss);
	if (risk === 0) return null;

	const pnl =
		direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
	return pnl / risk;
}

/**
 * Calculate planned Risk:Reward ratio
 */
export function calculatePlannedRR(
	entryPrice: number,
	stopLoss: number | null,
	takeProfit: number | null,
): number | null {
	if (stopLoss === null || takeProfit === null) return null;

	const risk = Math.abs(entryPrice - stopLoss);
	const reward = Math.abs(takeProfit - entryPrice);

	if (risk === 0) return null;
	return reward / risk;
}

/**
 * Calculate trade duration as human-readable string
 */
export function calculateDuration(
	entryTime: Date | string,
	exitTime: Date | string | null,
): string | null {
	if (!exitTime) return null;

	const ms = new Date(exitTime).getTime() - new Date(entryTime).getTime();
	const minutes = Math.floor(ms / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ${hours % 24}h`;
	if (hours > 0) return `${hours}h ${minutes % 60}m`;
	return `${minutes}m`;
}

/**
 * Calculate gross P&L (before fees)
 */
export function calculateGrossPnl(
	netPnl: number | null,
	fees: number | null,
): number | null {
	if (netPnl === null) return null;
	return netPnl + (fees ?? 0);
}

/**
 * Calculate Net ROI percentage
 * For futures: netPnl / (quantity * pointValue * entryPrice) * 100
 * Simplified: just netPnl as % of notional value
 */
export function calculateROI(
	netPnl: number | null,
	entryPrice: number,
	quantity: number,
	symbol: string,
	instrumentType: "futures" | "forex",
): number | null {
	if (netPnl === null) return null;

	let notionalValue: number;
	if (instrumentType === "futures") {
		const spec = getFuturesSpec(symbol);
		if (!spec) return null;
		notionalValue = entryPrice * quantity * spec.pointValue;
	} else {
		// Forex: assume standard lot = 100,000 units
		notionalValue = entryPrice * quantity * 100000;
	}

	if (notionalValue === 0) return null;
	return (netPnl / notionalValue) * 100;
}

// =============================================================================
// ALL STATS INTERFACE
// =============================================================================

export interface TradeStats {
	points: number | null;
	ticks: number | null; // For futures
	pips: number | null; // For forex
	ticksPerContract: number | null;
	grossPnl: number | null;
	roi: number | null;
	duration: string | null;
	rMultiple: number | null;
	plannedRR: number | null;
}

/**
 * Calculate all display stats for a trade
 */
export function calculateAllStats(trade: {
	entryPrice: string;
	exitPrice: string | null;
	direction: "long" | "short";
	quantity: string;
	netPnl: string | null;
	fees: string | null;
	stopLoss: string | null;
	takeProfit: string | null;
	entryTime: Date | string;
	exitTime: Date | string | null;
	symbol: string;
	instrumentType: "futures" | "forex";
}): TradeStats {
	const entry = parseFloat(trade.entryPrice);
	const exit = trade.exitPrice ? parseFloat(trade.exitPrice) : null;
	const qty = parseFloat(trade.quantity);
	const netPnl = trade.netPnl ? parseFloat(trade.netPnl) : null;
	const fees = trade.fees ? parseFloat(trade.fees) : null;
	const sl = trade.stopLoss ? parseFloat(trade.stopLoss) : null;
	const tp = trade.takeProfit ? parseFloat(trade.takeProfit) : null;

	const points = calculatePoints(entry, exit, trade.direction);
	const isFutures = trade.instrumentType === "futures";

	return {
		points,
		ticks: isFutures ? calculateTicks(points, trade.symbol) : null,
		pips: !isFutures ? calculatePips(points, trade.symbol) : null,
		ticksPerContract: calculateTicksPerContract(
			isFutures
				? calculateTicks(points, trade.symbol)
				: calculatePips(points, trade.symbol),
			qty,
		),
		grossPnl: calculateGrossPnl(netPnl, fees),
		roi: calculateROI(netPnl, entry, qty, trade.symbol, trade.instrumentType),
		duration: calculateDuration(trade.entryTime, trade.exitTime),
		rMultiple: calculateRMultiple(entry, exit, sl, trade.direction),
		plannedRR: calculatePlannedRR(entry, sl, tp),
	};
}
