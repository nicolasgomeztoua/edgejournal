import type { CSVParser, ParseResult, ParsedTrade, ParseError } from "./types";

/**
 * ProjectX CSV Parser
 * 
 * Requires TWO CSV files from ProjectX:
 * 1. Trades CSV - Main trade data (entry, exit, P&L)
 * 2. Orders CSV - Order flow with SL/TP levels and execution status
 * 
 * Trades CSV columns:
 * - Id, ContractName, EnteredAt, ExitedAt, EntryPrice, ExitPrice, Fees, PnL, Size, Type, etc.
 * 
 * Orders CSV columns:
 * - Id, ContractName, Status, Type, Size, Side, CreatedAt, FilledAt, StopPrice, LimitPrice,
 *   ExecutePrice, PositionDisposition, CreationDisposition, etc.
 */

// Futures contract month codes
const _MONTH_CODES: Record<string, string> = {
	F: "January", G: "February", H: "March", J: "April",
	K: "May", M: "June", N: "July", Q: "August",
	U: "September", V: "October", X: "November", Z: "December"
};

/**
 * Strip expiration suffix from contract name
 * MNQZ5 -> MNQ, ESZ5 -> ES, 6EZ5 -> 6E
 */
function stripExpiration(contractName: string): string {
	const match = contractName.match(/^(.+?)[FGHJKMNQUVXZ]\d{1,2}$/i);
	if (match?.[1]) {
		return match[1];
	}
	return contractName;
}

/**
 * Parse ProjectX date format: "11/14/2025 16:14:10 +01:00"
 */
function parseProjectXDate(dateStr: string): Date {
	if (!dateStr || dateStr.trim() === "") {
		return new Date();
	}
	
	const trimmed = dateStr.trim();
	const date = new Date(trimmed);
	if (!Number.isNaN(date.getTime())) {
		return date;
	}
	
	const match = trimmed.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*([+-]\d{2}:\d{2})?/);
	if (match) {
		const [, month, day, year, hour, min, sec, tz] = match;
		const isoString = `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}T${hour?.padStart(2, '0')}:${min}:${sec}${tz || '+00:00'}`;
		const parsed = new Date(isoString);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}
	
	return new Date();
}

/**
 * Parse CSV content handling quoted fields and commas
 */
function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;
	
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		
		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === ',' && !inQuotes) {
			result.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}
	result.push(current.trim());
	
	return result;
}

/**
 * Parse a full CSV into rows with header mapping
 */
function parseCSV(csvContent: string): { headers: string[]; rows: Record<string, string>[] } {
	const lines = csvContent.trim().split("\n").filter(line => line.trim() !== "");
	
	if (lines.length < 1) {
		return { headers: [], rows: [] };
	}
	
	const headers = parseCSVLine(lines[0]!);
	const rows: Record<string, string>[] = [];
	
	for (let i = 1; i < lines.length; i++) {
		const values = parseCSVLine(lines[i]!);
		const row: Record<string, string> = {};
		headers.forEach((header, index) => {
			row[header.toLowerCase().trim()] = values[index] || "";
		});
		rows.push(row);
	}
	
	return { headers, rows };
}

interface OrderInfo {
	stopLoss?: string;
	takeProfit?: string;
	stopLossHit: boolean;
	takeProfitHit: boolean;
	exitType: 'sl' | 'tp' | 'manual' | 'unknown';
}

/**
 * Extract SL/TP info from orders for a specific trade
 */
function getOrderInfoForTrade(
	orders: Record<string, string>[],
	contractName: string,
	entryTime: Date,
	exitTime: Date
): OrderInfo {
	// Find orders for this contract within the trade timeframe
	const relevantOrders = orders.filter(order => {
		const orderContract = order.contractname || '';
		const createdAt = order.createdat ? parseProjectXDate(order.createdat) : null;
		
		if (orderContract !== contractName || !createdAt) return false;
		
		// Order should be created around entry time (within a few minutes before exit)
		const entryMs = entryTime.getTime();
		const exitMs = exitTime.getTime();
		const orderMs = createdAt.getTime();
		
		// Allow orders created from 1 minute before entry to exit time
		return orderMs >= entryMs - 60000 && orderMs <= exitMs;
	});
	
	let stopLoss: string | undefined;
	let takeProfit: string | undefined;
	let stopLossHit = false;
	let takeProfitHit = false;
	let exitType: 'sl' | 'tp' | 'manual' | 'unknown' = 'unknown';
	
	for (const order of relevantOrders) {
		const disposition = order.creationdisposition || '';
		const status = order.status || '';
		const stopPrice = order.stopprice || '';
		const limitPrice = order.limitprice || '';
		const positionDisposition = order.positiondisposition || '';
		
		// Extract SL level
		if (disposition.toLowerCase() === 'stoploss' && stopPrice) {
			stopLoss = stopPrice;
			if (status.toLowerCase() === 'filled' && positionDisposition.toLowerCase() === 'closing') {
				stopLossHit = true;
				exitType = 'sl';
			}
		}
		
		// Extract TP level
		if (disposition.toLowerCase() === 'takeprofit' && limitPrice) {
			takeProfit = limitPrice;
			if (status.toLowerCase() === 'filled' && positionDisposition.toLowerCase() === 'closing') {
				takeProfitHit = true;
				exitType = 'tp';
			}
		}
		
		// Check for manual close
		if (disposition.toLowerCase() === 'closeposition' && status.toLowerCase() === 'filled') {
			if (!stopLossHit && !takeProfitHit) {
				exitType = 'manual';
			}
		}
	}
	
	return { stopLoss, takeProfit, stopLossHit, takeProfitHit, exitType };
}

export const projectxParser: CSVParser = {
	platform: "projectx",
	name: "ProjectX",
	description: "Import trades from ProjectX platform (requires Trades + Orders CSVs)",

	getExpectedColumns(): string[] {
		return [
			"Id",
			"ContractName",
			"EnteredAt",
			"ExitedAt",
			"EntryPrice",
			"ExitPrice",
			"Fees",
			"PnL",
			"Size",
			"Type",
		];
	},

	validateHeaders(headers: string[]): boolean {
		const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
		const requiredColumns = ["id", "contractname", "enteredat", "exitedat", "entryprice", "exitprice", "size", "type"];
		
		return requiredColumns.every((col) => 
			normalizedHeaders.some((h) => h === col || h.replace(/\s+/g, "") === col)
		);
	},

	async parse(csvContent: string): Promise<ParseResult> {
		// This is the single-file parse - just parses trades without SL/TP info
		return parseProjectXTrades(csvContent, null);
	},
};

/**
 * Parse ProjectX with both Trades and Orders CSVs
 */
export async function parseProjectXWithOrders(
	tradesCSV: string,
	ordersCSV: string
): Promise<ParseResult> {
	return parseProjectXTrades(tradesCSV, ordersCSV);
}

/**
 * Internal parse function that handles both modes
 */
function parseProjectXTrades(tradesCSV: string, ordersCSV: string | null): ParseResult {
	const trades: ParsedTrade[] = [];
	const errors: ParseError[] = [];
	const warnings: string[] = [];
	
	// Parse trades CSV
	const { headers: tradeHeaders, rows: tradeRows } = parseCSV(tradesCSV);
	
	if (tradeRows.length === 0) {
		return {
			success: false,
			trades: [],
			errors: [{ row: 0, message: "Trades CSV must have headers and at least one data row" }],
			warnings: [],
			totalRows: 0,
			parsedRows: 0,
			skippedRows: 0,
		};
	}
	
	// Parse orders CSV if provided
	let orderRows: Record<string, string>[] = [];
	if (ordersCSV) {
		const { rows } = parseCSV(ordersCSV);
		orderRows = rows;
		if (rows.length === 0) {
			warnings.push("Orders CSV was empty - SL/TP data will not be available");
		}
	} else {
		warnings.push("No Orders CSV provided - SL/TP data will not be available");
	}
	
	let parsedRows = 0;
	let skippedRows = 0;
	
	for (let i = 0; i < tradeRows.length; i++) {
		const row = tradeRows[i]!;
		
		try {
			const contractName = row.contractname || '';
			const enteredAt = row.enteredat || '';
			const exitedAt = row.exitedat || '';
			const entryPrice = row.entryprice || '';
			const exitPrice = row.exitprice || '';
			const fees = row.fees || '';
			const pnl = row.pnl || '';
			const size = row.size || '';
			const type = row.type || '';
			const externalId = row.id || '';
			const commissions = row.commissions || '';
			
			// Validate required fields
			if (!contractName || !entryPrice || !size || !type) {
				errors.push({
					row: i + 2,
					message: `Missing required fields`,
					rawData: JSON.stringify(row),
				});
				skippedRows++;
				continue;
			}
			
			// Parse direction
			const direction = type.toLowerCase() === "long" ? "long" : "short";
			
			// Parse dates
			const entryTime = parseProjectXDate(enteredAt);
			const exitTime = parseProjectXDate(exitedAt);
			
			// Strip expiration from symbol
			const symbol = stripExpiration(contractName);
			
			// Calculate total fees
			let totalFees = parseFloat(fees) || 0;
			if (commissions && parseFloat(commissions)) {
				totalFees += parseFloat(commissions);
			}
			
			// Get SL/TP info from orders if available
			let orderInfo: OrderInfo = {
				stopLossHit: false,
				takeProfitHit: false,
				exitType: 'unknown'
			};
			
			if (orderRows.length > 0) {
				orderInfo = getOrderInfoForTrade(orderRows, contractName, entryTime, exitTime);
			}
			
			const trade: ParsedTrade = {
				symbol: symbol.toUpperCase(),
				instrumentType: "futures",
				direction,
				entryPrice: entryPrice,
				entryTime,
				exitPrice: exitPrice,
				exitTime,
				quantity: size,
				stopLoss: orderInfo.stopLoss,
				takeProfit: orderInfo.takeProfit,
				stopLossHit: orderInfo.stopLossHit,
				takeProfitHit: orderInfo.takeProfitHit,
				fees: totalFees > 0 ? totalFees.toFixed(2) : undefined,
				profit: pnl || undefined,
				externalId: externalId || undefined,
				// Store exit type in comment for reference
				comment: orderInfo.exitType !== 'unknown' 
					? `Exit: ${orderInfo.exitType.toUpperCase()}`
					: undefined,
			};
			
			trades.push(trade);
			parsedRows++;
			
		} catch (err) {
			errors.push({
				row: i + 2,
				message: `Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`,
			});
			skippedRows++;
		}
	}
	
	if (parsedRows > 0 && skippedRows > 0) {
		warnings.push(`${skippedRows} row(s) were skipped due to missing or invalid data.`);
	}
	
	if (orderRows.length > 0) {
		const tradesWithSL = trades.filter(t => t.stopLoss).length;
		const tradesWithTP = trades.filter(t => t.takeProfit).length;
		warnings.push(`Found SL levels for ${tradesWithSL} trades, TP levels for ${tradesWithTP} trades`);
	}
	
	return {
		success: parsedRows > 0,
		trades,
		errors,
		warnings,
		totalRows: tradeRows.length,
		parsedRows,
		skippedRows,
	};
}

/**
 * Validate Orders CSV headers
 */
export function validateOrdersCSV(headers: string[]): boolean {
	const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
	const requiredColumns = ["id", "contractname", "status", "creationdisposition", "stopprice", "limitprice"];
	
	return requiredColumns.every((col) => 
		normalizedHeaders.some((h) => h === col || h.replace(/\s+/g, "") === col)
	);
}
